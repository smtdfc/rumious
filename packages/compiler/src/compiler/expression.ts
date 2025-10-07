import * as t from '@babel/types';
import _traverse, { NodePath } from '@babel/traverse';

const traverse = (
  typeof _traverse === 'function' ? _traverse : (_traverse as any).default
) as any;

export class ExpressionTransform {
  transform(ast: t.Expression): [t.Expression, Set<t.Expression>] {
    const deps = new Set<t.Expression>();
    const newAst = t.cloneNode(ast);

    traverse(
      t.file(t.program([t.expressionStatement(newAst)])),
      {
        MemberExpression(path: NodePath<t.MemberExpression>) {
          if (
            t.isIdentifier(path.node.property, { name: 'get' }) &&
            !path.node.computed
          ) {
            const target = path.node.object;
            deps.add(t.cloneNode(target, true));
          }
        },

        CallExpression(path: NodePath<t.CallExpression>) {
          if (t.isIdentifier(path.node.callee, { name: '$' })) {
            path.traverse({
              Identifier(innerPath) {
                if (innerPath.node.name !== '$') {
                  deps.add(t.cloneNode(innerPath.node, true));
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
