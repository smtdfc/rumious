function generateAppendChild(t, target, child) {
  return t.expressionStatement(
    t.callExpression(t.memberExpression(target, t.identifier('appendChild')), [
      child,
    ])
  );
}

function generateDynamicValueHandle(t, path, target, child, contextName) {
  const tempId = path.scope.generateUidIdentifier('_rumious_dymanic_');
  return [
    t.variableDeclaration('const', [
      t.variableDeclarator(
        tempId,
        t.callExpression(
          t.memberExpression(
            t.identifier('document'),
            t.identifier('createTextNode')
          ),
          [t.stringLiteral('')]
        )
      ),
    ]),
    generateAppendChild(t, target, tempId),
    t.expressionStatement(
      t.callExpression(
        t.memberExpression(
          t.identifier('window.RUMIOUS_JSX'),
          t.identifier('dynamicValue'),
          false
        ),
        [target, tempId, child, t.identifier(contextName)]
      )
    ),
  ];
}

function generateCreateText(t, text) {
  return t.callExpression(
    t.memberExpression(
      t.identifier('document'),
      t.identifier('createTextNode')
    ),
    [t.stringLiteral(text)]
  );
}

function generateCreateEl(t, varName, tagName) {
  return t.variableDeclaration('const', [
    t.variableDeclarator(
      varName,
      t.callExpression(
        t.memberExpression(
          t.identifier('document'),
          t.identifier('createElement')
        ),
        [t.stringLiteral(tagName)]
      )
    ),
  ]);
}

function generateCreateFrag(t, varName) {
  return t.variableDeclaration('const', [
    t.variableDeclarator(
      varName,
      t.callExpression(
        t.memberExpression(
          t.identifier('document'),
          t.identifier('createDocumentFragment')
        ),
        []
      )
    ),
  ]);
}

function generateSetAttr(t, target, name, value) {
  return t.expressionStatement(
    t.callExpression(t.memberExpression(target, t.identifier('setAttribute')), [
      t.stringLiteral(name),
      value,
    ])
  );
}

function generateSetProps(t, target, key, value) {
  return t.expressionStatement(
    t.assignmentExpression(
      '=',
      t.memberExpression(
        t.memberExpression(target, t.identifier('props')),
        typeof key === 'string' ? t.stringLiteral(key) : key,
        true
      ),
      value
    )
  );
}

function generateAddDirective(
  t,
  target,
  directive,
  modifier,
  value,
  contextName
) {
  return t.expressionStatement(
    t.callExpression(
      t.memberExpression(
        t.identifier('window.RUMIOUS_JSX'),
        t.identifier('addDirective'),
        false
      ),
      [
        target,
        t.identifier(contextName),
        t.stringLiteral(directive),
        t.stringLiteral(modifier),
        value,
      ]
    )
  );
}

function generateCreateComponent(t, varName, component) {
  return t.variableDeclaration('const', [
    t.variableDeclarator(
      varName,
      t.callExpression(
        t.memberExpression(
          t.identifier('window.RUMIOUS_JSX'),
          t.identifier('createComponent')
        ),
        [component]
      )
    ),
  ]);
}

module.exports = {
  generateAppendChild,
  generateDynamicValueHandle,
  generateCreateText,
  generateCreateEl,
  generateSetAttr,
  generateSetProps,
  generateAddDirective,
  generateCreateComponent,
  generateCreateFrag,
};
