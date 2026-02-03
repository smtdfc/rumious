import {
  identifier,
  importDeclaration,
  importSpecifier,
  stringLiteral,
  type Identifier,
  type ImportSpecifier,
  type Statement,
} from "@babel/types";
import { StringBuilder } from "./template.js";
import type { DynamicPart } from "../types/compiler.js";

export class CompileContext {
  count = 0;
  imports: Record<string, Identifier> = {};
  statements: Statement[] = [];
  htmlTemplate = new StringBuilder();
  dynamicParts: DynamicPart[] = [];
  nodePathInstructions: string[] = [];
  templateVar: Identifier = identifier("unknown");
  rootVar: Identifier = identifier("unknown");

  ensureImport(id: string) {
    if (!this.imports[id]) this.imports[id] = identifier(id);
    return this.imports[id];
  }

  getImportStatement() {
    let specifiers: ImportSpecifier[] = [];

    for (let imp in this.imports) {
      specifiers.push(importSpecifier(this.imports[imp]!, this.imports[imp]!));
    }

    return importDeclaration(specifiers, stringLiteral("@rumious/runtime"));
  }

  generateID(prefix = "_") {
    return `${prefix}_${this.count++}`;
  }
}
