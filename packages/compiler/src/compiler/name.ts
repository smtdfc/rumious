import * as t from '@babel/types';

export function getAttrNameAsString(attr: t.JSXAttribute): [string, boolean] {
  let name = '';
  let isNamespace = false;
  if (t.isJSXIdentifier(attr.name)) {
    name = attr.name.name;
  }

  if (t.isJSXNamespacedName(attr.name)) {
    const nsp = attr.name.namespace.name;
    const rname = attr.name.name.name;
    name = `${nsp}:${rname}`;
    isNamespace = true;
  }

  return [name, isNamespace];
}

export function getElementNameAsString(target: any): string {
  if (t.isJSXIdentifier(target)) {
    return target.name;
  }

  if (t.isJSXMemberExpression(target)) {
    return `${getElementNameAsString(target.object)}.${getElementNameAsString(target.property)}`;
  }

  return '';
}

export function isComponentName(name: string): boolean {
  return /^[A-Z]/.test(name);
}

export function getElementNameAsExpr(target: any): t.Expression {
  if (t.isJSXIdentifier(target)) {
    return t.identifier(target.name);
  }

  if (t.isJSXMemberExpression(target)) {
    return t.memberExpression(
      getElementNameAsExpr(target.object),
      getElementNameAsExpr(target.property),
    );
  }

  throw new Error('RumiousCompileError: Unknown element name !');
}
