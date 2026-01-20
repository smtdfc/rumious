import type { TSESTree } from "@typescript-eslint/typescript-estree";
import { Emitter } from "./emitter.js";
import type { CompileOptions } from "../types/compiler.js";

export class CompileContext {
  public code;
  public ast;
  public emitter;
  constructor(
    code: string,
    ast: TSESTree.Program,
    input: string,
    output: string,
    options?: CompileOptions,
  ) {
    this.code = code;
    this.ast = ast;
    this.emitter = new Emitter(input, code, output, options);
  }
}
