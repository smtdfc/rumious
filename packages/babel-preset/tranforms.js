const directives = ['on:', 'bind:', 'ref','childsRef','model'];

module.exports = function({ types: t }) {
  function parseChainsString(str) {
    const regex = /^\$([a-zA-Z_][a-zA-Z0-9_]*(?:\.[a-zA-Z_][a-zA-Z0-9_]*)*)$/;
    const match = str.match(regex);

    if (match) {
      const parts = match[1].split('.');
      const objectName = parts[0];
      const chains = parts.slice(1);
      const chainsString = `context.${objectName}.value${chains.length > 0 ? '.' + chains.join('.') : ''}`;

      return {
        objectName,
        chains,
        chainsString,
      };
    } else {
      return null;
    }
  }

  function getDirectiveValueType(nodeValue) {
    if (!nodeValue) return null;
    if (nodeValue.type === 'JSXExpressionContainer') return { type: 'expression', value: nodeValue.expression };
    if (nodeValue.type === 'StringLiteral') {
      let rawValue = nodeValue.value;
      let parsedValue = parseChainsString(rawValue);
      if (parsedValue) {
        return { type: 'dynamic_value', value: parsedValue };
      }
      return { type: 'string', value: nodeValue };
    }
    return null;
  }

  function createDirectiveCall(namespace, name, valueInfo) {
    return t.callExpression(
      t.identifier('RUMIOUS_JSX_SUPPORT.createDirective'),
      [
        t.stringLiteral(namespace),
        name ? t.stringLiteral(name) : t.nullLiteral(),
        t.objectExpression([
          t.objectProperty(t.identifier('type'), t.stringLiteral(valueInfo.type)),
          t.objectProperty(
            t.identifier('value'),
            valueInfo.type === 'dynamic_value' ? t.valueToNode(valueInfo.value) : valueInfo.value
          ),
          t.objectProperty(
            t.identifier('evaluator'),
            valueInfo.type === 'dynamic_value' ?
            t.arrowFunctionExpression(
             [t.identifier('context')],
              t.callExpression(
                t.newExpression(t.identifier('Function'), [
                    t.stringLiteral('context'),
                    t.stringLiteral('return '+valueInfo.value.chainsString)
                ]),
                [t.identifier('context')]
              )
            ) :
            t.nullLiteral()
          )
        ])
      ]
    );
  }

  function transformDirective(path, namespace, name, nodeValue) {
    const valueInfo = getDirectiveValueType(nodeValue);
    path.node.value = createDirectiveCall(namespace, name, valueInfo);
  }

  return {
    name: 'rumious-custom-jsx',
    visitor: {
      JSXAttribute(path) {
        const nodeName = path.node.name;
        const nodeValue = path.node.value;

        if (nodeName.type === 'JSXNamespacedName') {
          const namespace = nodeName.namespace.name;
          const name = nodeName.name.name;
          if (directives.includes(namespace + ':')) {
            transformDirective(path, namespace, name, nodeValue);
          }
        } else if (nodeName.type === 'JSXIdentifier') {
          const name = nodeName.name;
          if (directives.includes(name)) {
            transformDirective(path, name, null, nodeValue);
          }
        }
      }
    }
  };
};