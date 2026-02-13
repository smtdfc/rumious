import {
  arrayExpression,
  arrayPattern,
  arrowFunctionExpression,
  blockStatement,
  callExpression,
  expressionStatement,
  identifier,
  memberExpression,
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

  setTextContent(id: Identifier, expr: Expression, ctx: CompileContext) {
    let fn = ctx.ensureImport("$$text");
    return expressionStatement(callExpression(fn, [id, expr, ctx.ctxVar]));
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
