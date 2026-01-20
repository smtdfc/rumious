import type { TSESTree } from "@typescript-eslint/typescript-estree";

export function isJSXElement(node: any): node is TSESTree.JSXElement {
  return node.type === "JSXElement";
}

export function isJSXIdentifier(node: any): node is TSESTree.JSXIdentifier {
  return node.type === "JSXIdentifier";
}

export function isJSXMemberExpression(
  node: any,
): node is TSESTree.JSXMemberExpression {
  return node.type === "JSXMemberExpression";
}

export function isJSXAttribute(node: any): node is TSESTree.JSXAttribute {
  return node.type === "JSXAttribute";
}

export function isLiteral(node: any): node is TSESTree.Literal {
  return node.type === "Literal";
}
