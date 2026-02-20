import {
  arrayExpression,
  arrayPattern,
  arrowFunctionExpression,
  blockStatement,
  booleanLiteral,
  callExpression,
  expressionStatement,
  identifier,
  memberExpression,
  objectExpression,
  objectProperty,
  returnStatement,
  stringLiteral,
  variableDeclaration,
  variableDeclarator,
  type Expression,
  type Identifier,
  type SourceLocation,
  type Statement,
} from "@babel/types";
import type { CompileContext } from "./context.js";

export const AstHelpers = {
  createElement(
    id: Identifier,
    tagName: string,
    root: Identifier,
    ctx: CompileContext,
    loc: SourceLocation | null,
  ) {
    let fn = ctx.ensureImport("$$element");
    let stat = variableDeclaration("const", [
      variableDeclarator(
        id,
        callExpression(fn, [stringLiteral(tagName), root]),
      ),
    ]);

    stat.loc = loc;

    return stat;
  },

  createHtmlTemplate(id: Identifier, template: string, ctx: CompileContext) {
    let fn = ctx.ensureImport("$$template");
    let stat = variableDeclaration("const", [
      variableDeclarator(id, callExpression(fn, [stringLiteral(template)])),
    ]);

    return stat;
  },

  createIdentifier(name: string) {
    return identifier(name);
  },

  createWalker(
    id: Identifier,
    template: Identifier,
    path: string,
    ctx: CompileContext,
  ) {
    let fn = ctx.ensureImport("$$walk");
    let stat = variableDeclaration("const", [
      variableDeclarator(
        id,
        callExpression(fn, [template, stringLiteral(path)]),
      ),
    ]);

    return stat;
  },

  cloneTemplate(
    id: Identifier,
    template: Identifier,
    path: string,
    ctx: CompileContext,
  ) {
    let fn = ctx.ensureImport("$$clone");
    let stat = variableDeclaration("const", [
      variableDeclarator(id, callExpression(fn, [template])),
    ]);

    return stat;
  },

  addEffect(ctx: CompileContext, expr: Statement[], deps: Expression[] = []) {
    return expressionStatement(
      callExpression(memberExpression(ctx.ctxVar, identifier("addEffect")), [
        arrowFunctionExpression([], blockStatement(expr)),
        arrayExpression(deps),
      ]),
    );
  },

  createComponent(
    id: Identifier,
    node: Identifier,
    componentExpr: Expression,
    props: Record<string, Expression>,
    ctx: CompileContext,
  ) {
    const propsObject = objectExpression(
      Object.entries(props).map(([key, value]) =>
        objectProperty(identifier(key), value),
      ),
    );

    let fn = ctx.ensureImport("$$component");
    let stat = variableDeclaration("const", [
      variableDeclarator(
        id,
        callExpression(fn, [componentExpr, node, ctx.ctxVar, propsObject]),
      ),
    ]);

    return stat;
  },

  createForComponent(
    node: Identifier,
    template: Expression,
    data: Expression,
    key: Expression,
    other: Expression,
    ctx: CompileContext,
  ) {
    let fn = ctx.ensureImport("$$for");

    return expressionStatement(
      callExpression(fn, [node, ctx.ctxVar, template, data, other, key]),
    );
  },

  setAttribute(
    id: Identifier,
    name: string,
    expr: Expression,
    ctx: CompileContext,
  ) {
    return expressionStatement(
      callExpression(memberExpression(id, identifier("setAttribute")), [
        stringLiteral(name),
        expr,
      ]),
    );
  },

  setDynamicContent(id: Identifier, expr: Expression, ctx: CompileContext) {
    let fn = ctx.ensureImport("$$dynamic");
    return expressionStatement(callExpression(fn, [id, expr, ctx.ctxVar]));
  },

  event(
    id: Identifier,
    name: string,
    expr: Expression,
    isCapture: boolean,
    ctx: CompileContext,
  ) {
    let fn = ctx.ensureImport("$$event");
    return expressionStatement(
      callExpression(fn, [
        id,
        stringLiteral(name),
        expr,
        ctx.ctxVar,
        booleanLiteral(isCapture),
      ]),
    );
  },

  getRange(
    id: Identifier,
    node: Identifier,
    rememberKey: string,
    ctx: CompileContext,
  ) {
    let fn = ctx.ensureImport("$$range");
    let stat = variableDeclaration("const", [
      variableDeclarator(
        id,
        callExpression(fn, [node, stringLiteral(rememberKey), ctx.ctxVar]),
      ),
    ]);

    return stat;
  },

  createRootFn(
    root: Identifier,
    ctx: Identifier,
    stats: Statement[] = [],
    context: CompileContext,
  ) {
    const fn = context.ensureImport("$$createRenderer");

    return callExpression(fn, [
      arrowFunctionExpression(
        [ctx],
        blockStatement([
          variableDeclaration("const", [
            variableDeclarator(
              root,
              callExpression(
                memberExpression(
                  identifier("document"),
                  identifier("createDocumentFragment"),
                ),
                [],
              ),
            ),
          ]),
          ...stats,
          returnStatement(root),
        ]),
      ),
    ]);
  },
};
