import type { Expression, Identifier } from "@babel/types";

export class DependencyExtractor {
  static extract(expr: Expression): Identifier[] {
    let deps: Identifier[] = [];
    function visit(node: Expression) {
      if (node.type === "CallExpression") {
        if (
          node.callee.type === "MemberExpression" &&
          node.callee.property.type === "Identifier" &&
          node.callee.property.name === "get"
        ) {
          let object = node.callee.object;
          if (object.type === "Identifier") {
            deps.push(object);
          } else if (object.type === "MemberExpression") {
            let current: Expression = object;
            while (current.type === "MemberExpression") {
              current = current.object;
            }
            if (current.type === "Identifier") {
              deps.push(current as Identifier);
            }
          }
        }
      }

      // Recursively visit child nodes
      for (let key in node) {
        let value = (node as any)[key];
        if (Array.isArray(value)) {
          value.forEach((child) => {
            if (child && typeof child.type === "string") {
              visit(child);
            }
          });
        } else if (value && typeof value.type === "string") {
          visit(value);
        }
      }
    }
    visit(expr);
    return deps;
  }
}
