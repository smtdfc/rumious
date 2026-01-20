import type { TSESTree } from "@typescript-eslint/typescript-estree";
import type { CompileContext } from "./context.js";
import type { ListProp } from "../types/compiler.js";

export class Generator {
  static generateElement(
    ctx: CompileContext,
    id: string,
    openTag: TSESTree.JSXOpeningElement,
    name: TSESTree.JSXIdentifier,
  ) {
    const emitter = ctx.emitter;
    emitter.emit(`const ${id} = $$element(`, openTag.loc.start);
    emitter.emit(`"${name.name}"`, name.loc.start);
    emitter.emit(");");
  }

  static generateProps(ctx: CompileContext, id: string, props: ListProp) {
    const emitter = ctx.emitter;
    emitter.emit(`$$attr(${id},{`);
    for (let i = 0; i < props.length; i++) {
      const prop = props[i];
      if (prop?.type == "static_prop") {
        emitter.emit(`"${prop.name}`, prop.loc.name.start);
        emitter.emit(":");
        emitter.emit(prop.value, prop.loc.value.start);
        emitter.emit(",");
      }
    }
    emitter.emit("}");
  }
}
