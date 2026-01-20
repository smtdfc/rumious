import { parse, type TSESTree } from "@typescript-eslint/typescript-estree";
import { CompileContext } from "./context.js";
import {
  isJSXAttribute,
  isJSXElement,
  isJSXIdentifier,
  isLiteral,
} from "../utils/validate.js";
import { createID } from "../utils/id.js";
import { walk } from "estree-walker";
import { Generator } from "./generator.js";
import type { CompileOptions, ListProp, Prop } from "../types/compiler.js";

export class Compiler {
  constructor() {}

  compileAttrAValue(value: any) {}

  compileJSXAttribute(node: TSESTree.JSXAttribute, ctx: CompileContext): Prop {
    const em = ctx.emitter;
    let attrName = node.name as TSESTree.JSXIdentifier;
    let attrValue = node.value;
    if (isLiteral(attrValue)) {
      return {
        type: "static_prop",
        name: attrName.name,
        value: attrValue.raw,
        loc: {
          name: attrName.loc,
          value: attrValue.loc,
        },
      };
    }

    throw new Error("Invalid prop");
  }

  compileJSXElement(node: TSESTree.JSXElement, ctx: CompileContext) {
    const em = ctx.emitter;
    const openTag = node.openingElement;
    const name = openTag.name;
    let id = createID("ele");

    if (isJSXIdentifier(name)) {
      Generator.generateElement(ctx, id, openTag, name);
    }

    if (openTag.attributes.length > 0) {
      let props: ListProp = [];
      for (let index = 0; index < openTag.attributes.length; index++) {
        let attr = openTag.attributes[index];
        if (isJSXAttribute(attr))
          props.push(this.compileJSXAttribute(attr, ctx));
      }
      Generator.generateProps(ctx, id, props);
    }
  }

  getLoc(code: string, index: number) {
    const subStr = code.slice(0, index);
    const lines = subStr.split("\n");

    return {
      line: lines.length,
      column: lines[lines.length - 1]!.length,
    };
  }

  compile(
    code: string,
    input: string,
    output: string,
    options?: CompileOptions,
  ) {
    const ast = parse(code, {
      filePath: input,
      loc: true,
      range: true,
      jsx: true,
    });
    const context = new CompileContext(code, ast, input, output, options);

    let lastIndex = 0;
    const s = this;

    walk(ast as any, {
      enter(node: any, parent: any) {
        const leadingCode = context.code.slice(lastIndex, node.range[0]);
        if (isJSXElement(node)) {
          context.emitter.emit(leadingCode, s.getLoc(context.code, lastIndex));
          s.compileJSXElement(node, context);
          lastIndex = node.range[1];
          this.skip();
        }
      },
    });

    if (lastIndex < code.length) {
      context.emitter.emit(code.slice(lastIndex), s.getLoc(code, lastIndex));
    }

    return context.emitter.getContent();
  }
}
