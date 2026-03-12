#![allow(unused_variables)]
#![allow(dead_code)]
#![allow(unused_imports)]
#![allow(unused_must_use)]

use std::{
    collections::HashMap,
    fmt::{Write, format},
    io::SeekFrom,
    vec,
};

use swc_common::{DUMMY_SP, cache};
use swc_ecma_ast::{
    Expr, Ident, JSXAttrName, JSXAttrOrSpread, JSXAttrValue, JSXElement, JSXElementChild,
    JSXElementName, JSXExpr, JSXExprContainer, JSXText, Lit, Null, Stmt, Str,
};

use crate::{
    context::{Context, Counter, Path, PathInstruction, PathInstructionKind},
    helpers::{ASTHelper, ImportHelper},
    parts::{DynamicAttrPart, ExpressionPart, Part},
    utils::is_component,
};

pub struct Transformer;

impl Transformer {
    fn get_attr_name_as_str(node: &JSXAttrName) -> String {
        match node {
            JSXAttrName::Ident(name) => name.sym.to_string(),
            JSXAttrName::JSXNamespacedName(name) => {
                let namespace = name.ns.sym.to_string();
                let name = name.name.to_string();
                format!("{}:{}", namespace, name)
            }
        }
    }

    fn get_attr_value_as_expr(node: &JSXAttrValue) -> Expr {
        match node {
            JSXAttrValue::Str(s) => Expr::Lit(Lit::Null(Null { span: DUMMY_SP })),
            JSXAttrValue::JSXExprContainer(expr_container) => {
                let jsx_expr = &expr_container.expr;

                match jsx_expr {
                    JSXExpr::Expr(expr) => *expr.clone(),
                    JSXExpr::JSXEmptyExpr(expr) => Expr::Lit(Lit::Null(Null { span: DUMMY_SP })),
                }
            }

            JSXAttrValue::JSXElement(e) => Expr::Lit(Lit::Null(Null { span: DUMMY_SP })),
            JSXAttrValue::JSXFragment(e) => Expr::Lit(Lit::Null(Null { span: DUMMY_SP })),
        }
    }

    pub fn transform_attr(node: &JSXAttrOrSpread, ctx: &mut Context) {
        match node {
            JSXAttrOrSpread::JSXAttr(attr) => {
                let name = Self::get_attr_name_as_str(&attr.name);
                let value = attr.value.as_ref().expect("Cannot get attr value");

                match value {
                    JSXAttrValue::Str(str) => {
                        write!(
                            &mut ctx.html,
                            "{}=\"{}\" ",
                            name,
                            str.value.as_str().expect("Cannot get attr value")
                        );
                    }

                    JSXAttrValue::JSXExprContainer(expr_container) => {
                        let expr = Self::get_attr_value_as_expr(value);

                        ctx.parts.push(Part::DynamicAttr(DynamicAttrPart {
                            expr,
                            path: ctx.node_path_instructions.clone(),
                            deps: vec![],
                        }));
                    }

                    _ => {}
                }
            }

            _ => {}
        }
    }

    pub fn transform_element(node: &JSXElement, ctx: &mut Context) {
        let opening = &node.opening;
        let name = &opening.name;

        if !is_component(name) && matches!(name, JSXElementName::Ident(_)) {
            if let JSXElementName::Ident(element_name) = name {
                write!(&mut ctx.html, "<{} ", element_name.sym);

                for attr in &opening.attrs {
                    Self::transform_attr(attr, ctx);
                }

                write!(&mut ctx.html, ">");

                let pre_child_length = ctx.node_path_instructions.len();

                for (index, children) in node.children.iter().enumerate() {
                    if index == 0 {
                        ctx.node_path_instructions.mark(PathInstructionKind::First);
                    } else {
                        ctx.node_path_instructions
                            .mark(PathInstructionKind::Sibling);
                    }
                }

                ctx.node_path_instructions.truncate(pre_child_length);
                write!(&mut ctx.html, "</{}>", element_name.sym);
            }
        }
    }

    pub fn transform_text(node: &JSXText, ctx: &mut Context) {
        write!(&mut ctx.html, "{}", node.value);
    }

    pub fn transform_expression(node: &JSXExprContainer, ctx: &mut Context) {
        write!(&mut ctx.html, "<!{}/>", ctx.counter.increase());

        match &node.expr {
            JSXExpr::Expr(expr) => {
                let expr = &**expr;
                ctx.parts.push(Part::Expression(ExpressionPart {
                    expr: expr.clone(),
                    path: ctx.node_path_instructions.clone(),
                    deps: vec![],
                }));
            }

            JSXExpr::JSXEmptyExpr(expr) => {}
        }
    }

    pub fn transform_element_child(child: &JSXElementChild, ctx: &mut Context) {
        match child {
            JSXElementChild::JSXElement(node) => {
                let element = &**node;
                Self::transform_element(&element, ctx);
            }

            JSXElementChild::JSXText(node) => {
                Self::transform_text(node, ctx);
            }

            JSXElementChild::JSXExprContainer(node) => {
                Self::transform_expression(node, ctx);
            }

            _ => {}
        }
    }

    pub fn generate_hydration(
        ctx: &mut Context,
        counter: &mut Counter,
        import_manager: &mut ImportHelper,
    ) {
        let mut stats: Vec<Stmt> = vec![];
        let mut effects: Vec<Stmt> = vec![];
        let mut path_cache: HashMap<String, Ident> = HashMap::new();
        ctx.parts.sort_by(|a, b| a.path_len().cmp(&b.path_len()));

        for part in &ctx.parts {
            let key = part.path().to_string();
            if !path_cache.contains_key(&key) {
                let mut best_parent_path = "";
                let mut relative_path = "";

                for cached_path in path_cache.keys() {
                    if key.starts_with(cached_path) && cached_path.len() > best_parent_path.len() {
                        best_parent_path = cached_path;
                        relative_path = &key[cached_path.len()..];
                    }
                }

                let node_var = ASTHelper::generate_ident("$$_node".to_string(), counter);
                let mut source_ident = &ctx.root_var;
                if best_parent_path != "" {
                    source_ident = path_cache.get(best_parent_path).expect("REASON");
                }

                if relative_path == "" {
                    path_cache.insert(key, source_ident.clone());
                } else {
                    stats.push(ASTHelper::create_walker(
                        &node_var,
                        source_ident,
                        &key,
                        import_manager,
                    ));
                }
            }
        }
    }
}
