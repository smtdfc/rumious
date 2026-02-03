import fs from "fs";
import { Compiler } from "./compiler/compiler.js";
import type { CompileOptions } from "./types/compiler.js";

export function compile(code: string, options?: Partial<CompileOptions>) {
  const compiler = new Compiler();

  const result = compiler.compile(code, {
    ...options,
  });

  return result;
}

export function compileFromFile(
  entry: string,
  output: string,
  sourceMapOutput: string,
  options?: Partial<Exclude<CompileOptions, "filename" | "sourceMapFile">>,
) {
  const compiler = new Compiler();
  let entryFileContent = "";
  try {
    entryFileContent = fs.readFileSync(entry, "utf8");
  } catch (err) {
    throw err;
  }

  const { code, map } = compiler.compile(entryFileContent, {
    ...options,
    filename: entry,
    sourceMapFile: sourceMapOutput,
  });

  try {
    fs.writeFileSync(output, code);
  } catch (err) {
    throw err;
  }

  try {
    fs.writeFileSync(sourceMapOutput, JSON.stringify(map));
  } catch (err) {
    throw err;
  }
}

export * from "./compiler/index.js";
