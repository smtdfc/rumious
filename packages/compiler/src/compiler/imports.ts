import * as t from '@babel/types';
import { Context } from './context.js';

type IdentifierMap = {
  [name: string]: {
    aliasId: t.Identifier;
  };
};

type ImportData = {
  [moduleName: string]: IdentifierMap;
};

export class ImportHelper {
  public importsData: ImportData = {};

  requireId(context: Context, name: string, moduleName: string): t.Identifier {
    if (!context.program)
      throw Error('RumiousCompileError: Cannot create unique identifier !');
    const id = context.program.scope.generateUidIdentifier(name);
    if (!this.importsData[moduleName]) this.importsData[moduleName] = {};
    if (!this.importsData[moduleName][name])
      this.importsData[moduleName][name] = {
        aliasId: id,
      };
    return this.importsData[moduleName][name].aliasId;
  }

  generateImportDec(): t.ImportDeclaration[] {
    const importDec: t.ImportDeclaration[] = [];
    for (const moduleName in this.importsData) {
      const names: t.ImportSpecifier[] = [];
      for (const importObj in this.importsData[moduleName]) {
        names.push(
          t.importSpecifier(
            this.importsData[moduleName][importObj].aliasId,
            t.identifier(importObj),
          ),
        );
      }

      importDec.push(t.importDeclaration(names, t.stringLiteral(moduleName)));
    }
    return importDec;
  }
}
