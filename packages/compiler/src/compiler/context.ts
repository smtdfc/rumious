import { NodePath } from '@babel/traverse';
import * as t from '@babel/types';
import type { ImportHelper } from './imports.js';

export type CompileDirective = Partial<{
  preserveWhitespace: string | boolean;
}>;

export interface Context {
  importHelper: ImportHelper;
  program?: NodePath;
  scope: {
    rootElement: t.Identifier;
    rootCtx: t.Identifier;
  };
  statements: t.Statement[];
  compileDirectives: CompileDirective;
}
