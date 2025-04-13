
function generateAppendChild(t, target, child) {
  return t.expressionStatement(
    t.callExpression(t.memberExpression(target, t.identifier("appendChild")), [child])
  );
}

function generateDynamicValueHandle(t, path, target, child, contextName) {
  const tempId = path.scope.generateUidIdentifier("text");
  return [
    t.variableDeclaration("const", [
      t.variableDeclarator(
        tempId,
        t.callExpression(t.memberExpression(t.identifier("document"), t.identifier("createTextNode")), [
          t.stringLiteral(""),
        ])
      ),
    ]),
    t.expressionStatement(
      t.callExpression(t.memberExpression(t.identifier(contextName), t.identifier("dynamicValue"), false), [
        target,
        tempId,
        child,
      ])
    ),
  ];
}

function generateCreateText(t, text) {
  return t.callExpression(t.memberExpression(t.identifier("document"), t.identifier("createTextNode")), [
    t.stringLiteral(text),
  ]);
}

function generateCreateEl(t, varName, tagName) {
  return t.variableDeclaration("const", [
    t.variableDeclarator(
      varName,
      t.callExpression(t.memberExpression(t.identifier("document"), t.identifier("createElement")), [
        t.stringLiteral(tagName),
      ])
    ),
  ]);
}

function generateSetAttr(t, target, name, value) {
  return t.expressionStatement(
    t.callExpression(t.memberExpression(target, t.identifier("setAttribute")), [t.stringLiteral(name), value])
  );
}

function generateSetProps(t, target, key, value) {
  return t.expressionStatement(
    t.assignmentExpression(
      "=",
      t.memberExpression(t.memberExpression(target, t.identifier("props")), typeof key === "string" ? t.stringLiteral(key) : key, true),
      value
    )
  );
}


function generateAddDirective(t, target, directive, modifier, value, contextName) {
  return t.expressionStatement(
    t.callExpression(t.memberExpression(t.identifier(contextName), t.identifier("addDirective"), false), [
      target,
      t.stringLiteral(directive),
      t.stringLiteral(modifier),
      value,
    ])
  );
}

module.exports = {
  generateAppendChild,
  generateDynamicValueHandle,
  generateCreateText,
  generateCreateEl,
  generateSetAttr,
  generateSetProps,
  generateAddDirective,
};