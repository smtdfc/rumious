use swc_ecma_ast::{Expr, JSXElementName, JSXObject, Lit, MemberExpr, MemberProp, Str};

pub fn is_component(name: &JSXElementName) -> bool {
    match name {
        JSXElementName::Ident(id) => id.sym.chars().next().map_or(false, |c| c.is_uppercase()),
        JSXElementName::JSXMemberExpr(_) => true,

        JSXElementName::JSXNamespacedName(_) => true,
    }
}

pub fn get_expr_from_jsx_name(node: JSXElementName) -> Expr {
    match node {
        JSXElementName::Ident(i) => Expr::Ident(i),

        JSXElementName::JSXMemberExpr(node) => Expr::Member(MemberExpr {
            span: node.span,
            obj: Box::new(get_expr_from_jsx_object(node.obj)),
            prop: MemberProp::Ident(node.prop),
        }),

        JSXElementName::JSXNamespacedName(node) => Expr::Lit(Lit::Str(Str {
            span: node.span,
            value: format!("{}:{}", node.ns.sym, node.name.sym).into(),
            raw: None,
        })),
    }
}

fn get_expr_from_jsx_object(node: JSXObject) -> Expr {
    match node {
        JSXObject::Ident(i) => Expr::Ident(i),
        JSXObject::JSXMemberExpr(node) => Expr::Member(MemberExpr {
            span: node.span,
            obj: Box::new(get_expr_from_jsx_object(node.obj)),
            prop: MemberProp::Ident(node.prop),
        }),
    }
}
