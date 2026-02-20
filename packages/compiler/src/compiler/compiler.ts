import * as parser from "@babel/parser";
import traverse, { NodePath } from "@babel/traverse";
import generate from "@babel/generator";
import type { CompileOptions } from "../types/compiler.js";
import {
  callExpression,
  expressionStatement,
  identifier,
  inherits,
  isExpression,
  isJSXAttribute,
  isJSXElement,
  isJSXEmptyExpression,
  isJSXExpressionContainer,
  isJSXIdentifier,
  isJSXMemberExpression,
  isJSXNamespacedName,
  isJSXText,
  isStringLiteral,
  memberExpression,
  objectExpression,
  stringLiteral,
  type Expression,
  type Identifier,
  type JSXAttribute,
  type JSXElement,
  type JSXExpressionContainer,
  type JSXIdentifier,
  type JSXMemberExpression,
  type JSXSpreadAttribute,
  type JSXText,
  type Node,
  type Statement,
} from "@babel/types";
import { CompileContext } from "./context.js";
import { AstHelpers } from "./helpers.js";
import { isComponentName } from "./utils.js";
import { DependencyExtractor } from "./expression.js";

const traverseFn = (traverse as any).default || traverse;
const generatorFn = (generate as any).default || generate;

export class Compiler {
  constructor() {}

  forComponent(node: JSXElement, ctx: CompileContext, parent: Identifier) {
    let openElement = node.openingElement;
    const props = this.extractAllComponentProps(node);

    if (!props["template"]) {
      throw new Error("For component must be template prop.");
    }

    if (!props["data"]) {
      throw new Error("For component must be data prop.");
    }

    if (!props["key"]) {
      throw new Error("For component must be key prop.");
    }
    ctx.htmlTemplate.append(`<!${Date.now()}/>`);

    ctx.parts.push({
      type: "for",
      path: ctx.nodePathInstructions.slice().join(""),
      template: props["template"],
      data: props["data"],
      key: props["key"],
      other: props["other"] ?? objectExpression([]),
    });
  }

  fragment(node: JSXElement, ctx: CompileContext, parent: Identifier) {
    for (let index = 0; index < node.children.length; index++) {
      const children = node.children[index];

      if (index > 0) {
        ctx.nodePathInstructions.push("s");
      }

      this.node(children!, ctx, parent);
    }
  }

  component(node: JSXElement, ctx: CompileContext, parent: Identifier) {
    let openElement = node.openingElement;
    let elementName = openElement.name;

    if (isJSXIdentifier(elementName) || isJSXMemberExpression(elementName)) {
      if (isJSXIdentifier(elementName)) {
        let name = this.getAttrNameAsString(elementName);

        switch (name) {
          case "Fragment":
            this.fragment(node, ctx, parent);
            return;
          case "For":
            this.forComponent(node, ctx, parent);
            return;
        }
      }

      ctx.htmlTemplate.append(`<!${Date.now()}/>`);
      const componentExpr = this.getNameAsExpr(elementName);
      const props = this.extractAllComponentProps(node);
      ctx.parts.push({
        type: "component",
        expr: componentExpr,
        path: ctx.nodePathInstructions.slice().join(""),
        props,
      });
    }
  }

  extractAllComponentProps(node: JSXElement) {
    const props: Record<string, Expression> = {};

    for (
      let index = 0;
      index < node.openingElement.attributes.length;
      index++
    ) {
      const attr = node.openingElement.attributes[index]!;
      if (isJSXAttribute(attr)) {
        const attrName = this.getAttrNameAsString(attr.name)!;
        const attrValue = this.getValueAsExpr(attr.value!);
        props[attrName] = attrValue!;
      }
    }

    return props;
  }

  getNameAsExpr(node: JSXIdentifier | JSXMemberExpression) {
    if (isJSXIdentifier(node)) {
      let name = identifier(node.name);
      inherits(name, node);
      return name;
    } else if (isJSXMemberExpression(node)) {
      let object = this.getNameAsExpr(node.object);
      let property = this.getNameAsExpr(node.property);
      let member = memberExpression(object, property);
      inherits(member, node);
      return member;
    } else {
      throw new Error("Unsupported element name type");
    }
  }

  getAttrNameAsString(node: Node) {
    if (isJSXIdentifier(node)) {
      return node.name;
    } else if (isJSXNamespacedName(node)) {
      return `${node.namespace.name}:${node.name.name}`;
    }
  }

  getValueAsExpr(node: Node) {
    if (isExpression(node)) return node;
    else if (isJSXEmptyExpression(node)) return stringLiteral("");
    else if (isJSXText(node)) return stringLiteral(node.value);
    else if (isJSXExpressionContainer(node))
      return this.getValueAsExpr(node.expression);
    else if (isStringLiteral(node)) return node;
    else throw new Error("Unsupported attribute value type");
  }

  handleOnDirective(
    eventName: string,
    value: Expression,
    ctx: CompileContext,
    isCapture: boolean = false,
  ) {
    ctx.events.add(eventName);
    ctx.parts.push({
      type: "event",
      name: eventName,
      handler: value,
      isCapture,
      path: ctx.nodePathInstructions.slice().join(""),
    });
  }

  attribute(node: JSXAttribute | JSXSpreadAttribute, ctx: CompileContext) {
    if (isJSXAttribute(node)) {
      let attrName = node.name;
      let attrValue = node.value;

      if (isJSXNamespacedName(attrName)) {
        let namespace = attrName.namespace.name;
        let name = attrName.name.name;

        switch (namespace) {
          case "on":
            this.handleOnDirective(
              name,
              this.getValueAsExpr(attrValue!),
              ctx,
              false,
            );
            return;
          case "capture":
            this.handleOnDirective(
              name,
              this.getValueAsExpr(attrValue!),
              ctx,
              true,
            );
            return;
        }
      }

      if (isStringLiteral(attrValue)) {
        ctx.htmlTemplate.append(
          ` ${this.getAttrNameAsString(attrName)}="${attrValue.value}" `,
        );
      } else if (isJSXExpressionContainer(attrValue)) {
        const deps = DependencyExtractor.extract(
          this.getValueAsExpr(attrValue.expression)!,
        );

        ctx.parts.push({
          type: "attr",
          name: this.getAttrNameAsString(attrName)!,
          expr: this.getValueAsExpr(attrValue.expression)!,
          path: ctx.nodePathInstructions.slice().join(""),
          deps,
        });
      }
    }
  }

  element(node: JSXElement, ctx: CompileContext, parent: Identifier) {
    let openElement = node.openingElement;
    let elementName = openElement.name;
    if (isJSXIdentifier(elementName) && !isComponentName(elementName.name)) {
      ctx.htmlTemplate.append(`<${elementName.name} `);

      for (let index = 0; index < openElement.attributes.length; index++) {
        this.attribute(openElement.attributes[index]!, ctx);
      }

      ctx.htmlTemplate.append(`>`);

      const preChildrenLength = ctx.nodePathInstructions.length;

      for (let index = 0; index < node.children.length; index++) {
        const children = node.children[index];

        if (index === 0) {
          ctx.nodePathInstructions.push("f");
        } else {
          ctx.nodePathInstructions.push("s");
        }

        this.node(children!, ctx, parent);
      }

      ctx.nodePathInstructions.length = preChildrenLength;

      ctx.htmlTemplate.append(`</${elementName.name}>`);
    } else {
      this.component(node, ctx, parent);
    }
  }

  node(node: Node, ctx: CompileContext, parent: Identifier) {
    if (isJSXElement(node)) {
      this.element(node, ctx, parent);
    }

    if (isJSXText(node)) {
      this.text(node, ctx, parent);
    }

    if (isJSXExpressionContainer(node)) {
      this.expression(node, ctx, parent);
    }
  }

  expression(
    node: JSXExpressionContainer,
    ctx: CompileContext,
    parent: Identifier,
  ) {
    ctx.htmlTemplate.append(`<!${Date.now()}/>`);
    ctx.parts.push({
      type: "expr",
      expr: this.getValueAsExpr(node.expression)!,
      path: ctx.nodePathInstructions.slice().join(""),
      deps: DependencyExtractor.extract(this.getValueAsExpr(node.expression)!),
    });
  }

  text(node: JSXText, ctx: CompileContext, parent: Identifier) {
    ctx.htmlTemplate.append(node.value);
  }

  generateHydration(ctx: CompileContext) {
    let stats: Statement[] = [];
    let effects: Statement[] = [];
    const pathCache = new Map<string, Identifier>();

    const sortedParts = [...ctx.parts].sort(
      (a, b) => a.path.length - b.path.length,
    );

    for (const part of sortedParts) {
      if (!pathCache.has(part.path)) {
        let bestParentPath = "";
        let relativePath = part.path;

        for (const cachedPath of pathCache.keys()) {
          if (
            part.path.startsWith(cachedPath) &&
            cachedPath.length > bestParentPath.length
          ) {
            bestParentPath = cachedPath;
            relativePath = part.path.slice(cachedPath.length);
          }
        }

        const nodeVar = AstHelpers.createIdentifier(ctx.generateID("node"));
        const sourceIdentifier =
          bestParentPath !== "" ? pathCache.get(bestParentPath)! : ctx.rootVar;

        if (relativePath === "") {
          pathCache.set(part.path, sourceIdentifier);
        } else {
          stats.push(
            AstHelpers.createWalker(
              nodeVar,
              sourceIdentifier,
              relativePath,
              ctx,
            ),
          );
          pathCache.set(part.path, nodeVar);
        }
      }

      if (part.type === "attr") {
        const currentNode = pathCache.get(part.path)!;
        effects.push(
          AstHelpers.addEffect(
            ctx,
            [AstHelpers.setAttribute(currentNode, part.name, part.expr, ctx)],
            part.deps,
          ),
        );
      } else if (part.type === "expr") {
        const currentNode = pathCache.get(part.path)!;
        const rememberKey = `key_${currentNode.name}_${part.path}`;
        const r = identifier(ctx.generateID("range"));
        effects.push(
          AstHelpers.addEffect(
            ctx,
            [
              AstHelpers.getRange(r, currentNode, rememberKey, ctx),
              AstHelpers.setDynamicContent(r, part.expr, ctx),
            ],
            part.deps,
          ),
        );
      } else if (part.type === "component") {
        const currentNode = pathCache.get(part.path)!;
        const componentInstance = identifier(ctx.generateID("component"));
        effects.push(
          AstHelpers.createComponent(
            componentInstance,
            currentNode,
            part.expr,
            part.props,
            ctx,
          ),
        );
      } else if (part.type === "event") {
        const currentNode = pathCache.get(part.path)!;
        effects.push(
          AstHelpers.event(
            currentNode,
            part.name,
            part.handler,
            part.isCapture,
            ctx,
          ),
        );
      } else if (part.type === "for") {
        const currentNode = pathCache.get(part.path)!;
        const rememberKey = `key_${currentNode.name}_${part.path}_for`;
        const r = identifier(ctx.generateID("range"));

        effects.push(
          AstHelpers.addEffect(
            ctx,
            [
              AstHelpers.getRange(r, currentNode, rememberKey, ctx),
              AstHelpers.createForComponent(
                r,
                part.template,
                part.data,
                part.key,
                part.other,
                ctx,
              ),
            ],
            [],
          ),
        );
      }
    }

    return [...stats, ...effects];
  }

  compile(code: string, options?: Partial<CompileOptions>) {
    const parseOptions: any = {
      sourceType: "module",
      plugins: ["jsx", "typescript"],
    };

    if (options?.strictMode !== undefined)
      parseOptions.strictMode = options.strictMode;
    if (options?.filename !== undefined)
      parseOptions.sourceFilename = options.filename;

    const context = new CompileContext();
    const ast = parser.parse(code, parseOptions);

    const s = this;

    traverseFn(ast, {
      JSXElement(path: NodePath<JSXElement>) {
        const templateVar = AstHelpers.createIdentifier(
          context.generateID("temp"),
        );
        const rootVarName = context.generateID("root");
        const rootIdentifier = AstHelpers.createIdentifier(rootVarName);
        const ctxVarName = context.generateID("ctx");
        const ctxIdentifier = AstHelpers.createIdentifier(ctxVarName);
        const templateClonedVar = AstHelpers.createIdentifier("temp_cloned");
        context.templateVar = templateClonedVar;
        context.rootVar = rootIdentifier;
        context.ctxVar = ctxIdentifier;

        context.nodePathInstructions = ["f"];
        context.statements.push(
          AstHelpers.cloneTemplate(templateClonedVar, templateVar, "", context),
        );

        context.statements.push(
          expressionStatement(
            callExpression(
              memberExpression(rootIdentifier, identifier("appendChild")),
              [templateClonedVar],
            ),
          ),
        );

        s.element(path.node, context, rootIdentifier);

        context.statements.push(...s.generateHydration(context));
        const fn = AstHelpers.createRootFn(
          rootIdentifier,
          ctxIdentifier,
          context.statements,
          context,
        );

        path.replaceWith(fn);
        ast.program.body.unshift(
          AstHelpers.createHtmlTemplate(
            templateVar,
            context.htmlTemplate.toString(),
            context,
          ),
        );

        context.nodePathInstructions = [];
        context.statements = [];
        context.htmlTemplate.clear();
        context.parts = [];
      },
    });

    ast.program.body.unshift(context.getImportStatement());

    const result = generatorFn(
      ast,
      {
        filename: options?.filename,
        sourceMapTarget: options?.filename,
        sourceFileName: options?.filename,
        sourceMaps: true,
      },
      code,
    );

    if (options?.sourceMapFile) {
      result.code += `\n//# sourceMappingURL=${options.sourceMapFile}`;
    }

    return { code: result.code, map: result.map };
  }
}
