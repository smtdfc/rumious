import * as t from '@babel/types';

export function getAttrAsValue(attr: t.JSXAttribute): any {
  const value = attr.value;

  if (!value) return true;

  if (t.isStringLiteral(value)) {
    return value.value;
  }

  if (t.isJSXExpressionContainer(value)) {
    const expression = value.expression;

    if (t.isNullLiteral(expression)) {
      return null;
    }

    if (
      t.isStringLiteral(expression) ||
      t.isNumericLiteral(expression) ||
      t.isBooleanLiteral(expression)
    ) {
      return expression.value;
    }
  }

  return undefined;
}

export function getAttrValue(attr: t.JSXAttribute): t.Expression {
  if (t.isStringLiteral(attr.value)) {
    return attr.value;
  }

  if (
    t.isJSXExpressionContainer(attr.value) &&
    !t.isJSXEmptyExpression(attr.value.expression)
  ) {
    return attr.value.expression;
  }

  return t.nullLiteral();
}
