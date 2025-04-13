
const { declare } = require('@babel/helper-plugin-utils');
const { randomName } = require('./utils');
const {
  generateCreateEl,
  generateAppendChild,
  generateDynamicValueHandle,
  generateCreateText,
} = require('./astGenerators');
const {
  processAttributes,
  processProps,
  jsxNameToExpression,
} = require('./jsxProcessor');

function transformJSXElement(t, path, element, contextName) {
  const tagName = element.openingElement ? element.openingElement.name : null;
  const isComponent = tagName && (t.isJSXMemberExpression(tagName) || /^[A-Z]/.test(tagName.name));
  const isFragment = t.isJSXFragment(element);
  const elId = path.scope.generateUidIdentifier("rumious_el");
  const statements = [];
  
  if (isFragment) {
    const fragmentContainer = path.scope.generateUidIdentifier("rumious_frag");
    statements.push(t.variableDeclaration("const", [t.variableDeclarator(fragmentContainer, t.arrayExpression([]))]));
    
    if (!element.children || element.children.length === 0) {
      return { elId: fragmentContainer, statements };
    }
    
    for (const child of element.children) {
      if (t.isJSXText(child)) {
        const text = child.value;
        if (text) {
          const textNode = generateCreateText(t, text);
          const tempId = path.scope.generateUidIdentifier("_text_");
          statements.push(
            t.variableDeclaration("const", [t.variableDeclarator(tempId, textNode)]),
            t.expressionStatement(
              t.callExpression(t.memberExpression(fragmentContainer, t.identifier("push")), [tempId])
            )
          );
        }
      } else if (t.isJSXExpressionContainer(child)) {
        if (child.expression.type !== "NullLiteral" && child.expression.type !== "UndefinedLiteral") {
          const tempId = path.scope.generateUidIdentifier("_dyn_");
          statements.push(
            t.variableDeclaration("const", [t.variableDeclarator(tempId, child.expression)]),
            t.expressionStatement(
              t.callExpression(t.memberExpression(t.identifier(contextName), t.identifier("dynamicValue")), [
                fragmentContainer,
                tempId,
              ])
            )
          );
        }
      } else if (t.isJSXElement(child) || t.isJSXFragment(child)) {
        const nested = transformJSXElement(t, path, child, contextName);
        statements.push(...nested.statements);
        statements.push(
          t.expressionStatement(
            t.callExpression(t.memberExpression(fragmentContainer, t.identifier("push")), [nested.elId])
          )
        );
      }
    }
    
    return { elId: fragmentContainer, statements };
  }
  
  if (isComponent) {
    statements.push(generateCreateEl(t, elId, "rumious-component"));
    statements.push(
      t.expressionStatement(
        t.callExpression(t.memberExpression(elId, t.identifier("setup")), [t.identifier(contextName),jsxNameToExpression(t, tagName)])
      )
    );
    statements.push(...processProps(t, elId, element.openingElement.attributes));
  } else {
    statements.push(generateCreateEl(t, elId, tagName ? tagName.name : "div"));
    statements.push(...processAttributes(t, elId, element.openingElement.attributes, contextName));
  }
  
  for (const child of element.children) {
    if (t.isJSXText(child)) {
      const text = child.value.trim();
      if (text) {
        const textNode = generateCreateText(t, text);
        statements.push(generateAppendChild(t, elId, textNode));
      }
    } else if (t.isJSXExpressionContainer(child)) {
      if (child.expression.type !== "NullLiteral" && child.expression.type !== "UndefinedLiteral") {
        statements.push(...generateDynamicValueHandle(t, path, elId, child.expression, contextName));
      }
    } else if (t.isJSXElement(child) || t.isJSXFragment(child)) {
      const nested = transformJSXElement(t, path, child, contextName);
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
    name: "jsx-to-dom",
    visitor: {
      JSXElement(path) {
        const rootName = randomName("rumious_root");
        const contextName = randomName("rumious_ctx");
        const { elId, statements } = transformJSXElement(t, path, path.node, contextName);
        
        statements.push(
          t.expressionStatement(
            t.callExpression(t.memberExpression(t.identifier(rootName), t.identifier("appendChild")), [elId])
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
            t.memberExpression(t.identifier("window"), t.identifier("RUMIOUS_JSX")),
            t.identifier("template")
          ),
          [fn]
        );
        
        path.replaceWith(callTemplate);
      },
    },
  };
});