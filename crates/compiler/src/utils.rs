use swc_ecma_ast::JSXElementName;

pub fn is_component(name: &JSXElementName) -> bool {
    match name {
        JSXElementName::Ident(id) => id.sym.chars().next().map_or(false, |c| c.is_uppercase()),
        JSXElementName::JSXMemberExpr(_) => true,

        JSXElementName::JSXNamespacedName(_) => true,
    }
}
