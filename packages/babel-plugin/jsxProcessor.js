
const {
  generateAddDirective,
  generateSetAttr,
  generateSetProps,
} = require('./astGenerators');

function processDirective(t, target, attr, directive, modifier, contextName) {
  const value = attr.value ?
    t.isStringLiteral(attr.value) ?
    attr.value :
    t.isJSXExpressionContainer(attr.value) ?
    attr.value.expression :
    t.stringLiteral("") :
    t.booleanLiteral(true);
  return generateAddDirective(t, target, directive, modifier, value, contextName);
}

function processNamespace(t, target, attr, contextName) {
  const name = attr.name.name.name;
  const namespace = attr.name.namespace.name;
  if (["bind", "on"].includes(namespace)) {
    return processDirective(t, target, attr, namespace, name, contextName);
  }
  const value = attr.value ?
    t.isStringLiteral(attr.value) ?
    attr.value :
    t.isJSXExpressionContainer(attr.value) ?
    attr.value.expression :
    t.stringLiteral("") :
    t.booleanLiteral(true);
  return generateSetAttr(t, target, t.binaryExpression("+", t.stringLiteral(`${namespace}:`), t.stringLiteral(name)), value);
}

function processAttributes(t, elId, attributes, contextName) {
  const statements = [];
  const standaloneDirectives = ["ref", "model"];
  
  for (const attr of attributes) {
    if (t.isJSXAttribute(attr) && !t.isJSXNamespacedName(attr.name)) {
      const name = attr.name.name;
      const value = attr.value ?
        t.isStringLiteral(attr.value) ?
        attr.value :
        t.isJSXExpressionContainer(attr.value) ?
        attr.value.expression :
        t.stringLiteral("") :
        t.booleanLiteral(true);
      if (standaloneDirectives.includes(name)) {
        statements.push(processDirective(t, elId, attr, "standalone", name, contextName));
      } else {
        statements.push(generateSetAttr(t, elId, name, value));
      }
    } else if (t.isJSXAttribute(attr) && t.isJSXNamespacedName(attr.name)) {
      statements.push(processNamespace(t, elId, attr, contextName));
    } else if (t.isJSXSpreadAttribute(attr)) {
      const props = attr.argument;
      const key = t.identifier("key");
      const value = t.memberExpression(props, key, true);
      statements.push(
        t.forInStatement(
          t.variableDeclaration("let", [t.variableDeclarator(key)]),
          props,
          t.blockStatement([
            t.expressionStatement(t.callExpression(t.memberExpression(elId, t.identifier("setAttribute")), [key, value])),
          ])
        )
      );
    }
  }
  return statements;
}

function processProps(t, elId, props) {
  const statements = [];
  for (let prop of props) {
    if (t.isJSXAttribute(prop)) {
      const name = prop.name.name;
      const value = prop.value ?
        t.isStringLiteral(prop.value) ?
        prop.value :
        t.isJSXExpressionContainer(prop.value) ?
        prop.value.expression :
        t.stringLiteral("") :
        t.booleanLiteral(true);
      statements.push(generateSetProps(t, elId, name, value));
    } else if (t.isJSXSpreadAttribute(prop)) {
      const propExpr = prop.argument;
      const key = t.identifier("key");
      const value = t.memberExpression(propExpr, key, true);
      statements.push(
        t.forInStatement(
          t.variableDeclaration("let", [t.variableDeclarator(key)]),
          propExpr,
          t.blockStatement([generateSetProps(t, elId, key, value)])
        )
      );
    }
  }
  return statements;
}

function jsxNameToExpression(t, name) {
  if (t.isJSXIdentifier(name)) return t.identifier(name.name);
  if (t.isJSXMemberExpression(name)) {
    return t.memberExpression(jsxNameToExpression(t, name.object), t.identifier(name.property.name));
  }
  return t.identifier("unknown");
}

module.exports = {
  processDirective,
  processNamespace,
  processAttributes,
  processProps,
  jsxNameToExpression,
};