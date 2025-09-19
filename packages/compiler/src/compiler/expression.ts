import * as t from '@babel/types';
import _traverse, { NodePath } from '@babel/traverse';

const traverse = (
  typeof _traverse === 'function' ? _traverse : (_traverse as any).default
) as any;

export class ExpressionTransform {
  transform(ast: t.Expression): [t.Expression, Set<t.Identifier>] {
    const deps = new Set<t.Identifier>();
    const newAst = t.cloneNode(ast);

    traverse(
      t.file(t.program([t.expressionStatement(newAst)])),
      {
        MemberExpression(path: NodePath<t.MemberExpression>) {
          if (
            t.isIdentifier(path.node.property, { name: 'get' }) &&
            !path.node.computed
          ) {
            const obj = path.node.object;
            if (t.isIdentifier(obj)) {
              deps.add(obj);
            }
          }
        },

        CallExpression(path: NodePath<t.CallExpression>) {
          if (t.isIdentifier(path.node.callee, { name: '$' })) {
            path.traverse({
              Identifier(innerPath) {
                if (innerPath.node.name !== '$') {
                  deps.add(innerPath.node);
                }
              },
            });
          }
        },
      },
      undefined,
      undefined,
    );

    return [t.arrowFunctionExpression([], newAst), deps];
  }
}
