import { SourceMapGenerator } from "source-map";
import type { CompileOptions } from "../types/compiler.js";

export class Emitter {
  private output: string = "";
  private line: number = 1;
  private column: number = 0;
  private map: SourceMapGenerator;

  constructor(
    public filename: string,
    originalCode: string,
    outputFile: string,
    public options?: CompileOptions,
  ) {
    this.map = new SourceMapGenerator({ file: outputFile });
    this.map.setSourceContent(filename, originalCode);
  }

  emit(code: string, original?: { line: number; column: number }) {
    if (original) {
      this.map.addMapping({
        generated: { line: this.line, column: this.column },
        original: { line: original.line, column: original.column },
        source: this.filename,
      });
    }

    for (let i = 0; i < code.length; i++) {
      if (code[i] === "\n") {
        this.line++;
        this.column = 0;
      } else {
        this.column++;
      }
    }

    this.output += code;
  }

  getContent() {
    const mapString = this.map.toString();
    let inlineSourceMap = "";

    if (this.options?.sourcemap && this.options.inlineSourcemap) {
      const base64Map = Buffer.from(mapString).toString("base64");
      inlineSourceMap = `\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,${base64Map}`;
    }

    return {
      code: this.output + inlineSourceMap,
      map: this.options?.sourcemap ? mapString : null,
    };
  }
}
