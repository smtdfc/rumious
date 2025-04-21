const { declare } = require('@babel/helper-plugin-utils');
const { randomName } = require('./utils');
const {
  generateCreateEl,
  generateAppendChild,
  generateDynamicValueHandle,
  generateCreateText,
  generateCreateComponent,
  generateCreateFrag,
} = require('./astGenerators');
const {
  processAttributes,
  processProps,
  jsxNameToExpression,
} = require('./jsxProcessor');

function attachSourceMeta(t, elId, node, filename) {
  if (process.env.NODE_ENV !== 'development' || !node.loc) return [];

  const { line, column } = node.loc.start;

  return [
    t.expressionStatement(
      t.assignmentExpression(
        '=',
        t.memberExpression(elId, t.identifier('_source')),
        t.objectExpression([
          t.objectProperty(t.identifier('fileName'), t.stringLiteral(filename)),
          t.objectProperty(t.identifier('line'), t.numericLiteral(line)),
          t.objectProperty(t.identifier('column'), t.numericLiteral(column)),
        ])
      )
    ),
  ];
}

function transformJSXElement(t, path, element, contextName, filename) {
  const tagName = element.openingElement ? element.openingElement.name : null;
  const isComponent =
    tagName &&
    (t.isJSXMemberExpression(tagName) || /^[A-Z]/.test(tagName.name));
  const isFragment = isComponent && tagName.name === 'Fragment';
  const elId = isFragment
    ? path.scope.generateUidIdentifier('rumious_frag')
    : path.scope.generateUidIdentifier('rumious_el');
  const statements = [];

  if (isFragment) {
    statements.push(generateCreateFrag(t, elId));
    statements.push(...attachSourceMeta(t, elId, element, filename));

    if (!element.children || element.children.length === 0) {
      return { elId: elId, statements };
    }

    for (const child of element.children) {
      if (t.isJSXText(child)) {
        const text = child.value;
        if (text) {
          const textNode = generateCreateText(t, text);
          statements.push(generateAppendChild(t, elId, textNode));
        }
      } else if (t.isJSXExpressionContainer(child)) {
        if (
          child.expression.type !== 'NullLiteral' &&
          child.expression.type !== 'UndefinedLiteral'
        ) {
          statements.push(
            ...generateDynamicValueHandle(
              t,
              path,
              elId,
              child.expression,
              contextName
            )
          );
        }
      } else if (t.isJSXElement(child) || t.isJSXFragment(child)) {
        const nested = transformJSXElement(
          t,
          path,
          child,
          contextName,
          filename
        );
        statements.push(...nested.statements);
        statements.push(generateAppendChild(t, elId, nested.elId));
      }
    }
    return { elId: elId, statements };
  }

  if (isComponent) {
    statements.push(
      generateCreateComponent(t, elId, jsxNameToExpression(t, tagName))
    );
    statements.push(...attachSourceMeta(t, elId, element, filename));

    statements.push(
      t.expressionStatement(
        t.callExpression(t.memberExpression(elId, t.identifier('setup')), [
          t.identifier(contextName),
          jsxNameToExpression(t, tagName),
        ])
      )
    );
    statements.push(
      ...processProps(t, elId, element.openingElement.attributes)
    );
  } else {
    statements.push(generateCreateEl(t, elId, tagName ? tagName.name : 'div'));
    statements.push(...attachSourceMeta(t, elId, element, filename));
    statements.push(
      ...processAttributes(
        t,
        elId,
        element.openingElement.attributes,
        contextName
      )
    );
  }

  for (const child of element.children) {
    if (t.isJSXText(child)) {
      const text = child.value;
      if (text) {
        const textNode = generateCreateText(t, text);
        statements.push(generateAppendChild(t, elId, textNode));
      }
    } else if (t.isJSXExpressionContainer(child)) {
      if (
        child.expression.type !== 'NullLiteral' &&
        child.expression.type !== 'UndefinedLiteral'
      ) {
        statements.push(
          ...generateDynamicValueHandle(
            t,
            path,
            elId,
            child.expression,
            contextName
          )
        );
      }
    } else if (t.isJSXElement(child) || t.isJSXFragment(child)) {
      const nested = transformJSXElement(t, path, child, contextName, filename);
      statements.push(...nested.statements);
      statements.push(generateAppendChild(t, elId, nested.elId));
    }
  }

  return { elId, statements };
}

module.exports = declare((api) => {
  api.assertVersion(7);
  const t = api.types;

  return {
    name: 'rumious-babel-plugin',
    visitor: {
      JSXElement(path) {
        const rootName = randomName('rumious_root');
        const contextName = randomName('rumious_ctx');
        const filename = path.hub.file.opts.filename || 'unknown_file';

        const { elId, statements } = transformJSXElement(
          t,
          path,
          path.node,
          contextName,
          filename
        );

        statements.push(
          t.expressionStatement(
            t.callExpression(
              t.memberExpression(
                t.identifier(rootName),
                t.identifier('appendChild')
              ),
              [elId]
            )
          )
        );
        statements.push(t.returnStatement(t.identifier(rootName)));

        const fn = t.functionExpression(
          null,
          [t.identifier(rootName), t.identifier(contextName)],
          t.blockStatement(statements.map((s) => t.cloneNode(s, true)))
        );

        const callTemplate = t.callExpression(
          t.memberExpression(
            t.memberExpression(
              t.identifier('window'),
              t.identifier('RUMIOUS_JSX')
            ),
            t.identifier('template')
          ),
          [fn]
        );

        path.replaceWith(callTemplate);
      },
    },
  };
});
