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
    Bool, Expr, Ident, JSXAttrName, JSXAttrOrSpread, JSXAttrValue, JSXElement, JSXElementChild,
    JSXElementName, JSXExpr, JSXExprContainer, JSXText, KeyValueProp, Lit, Null, ObjectLit, Prop,
    PropName, PropOrSpread, Stmt, Str,
};

use crate::{
    context::{Context, Counter, Path, PathInstruction, PathInstructionKind},
    helpers::{ASTHelper, ImportHelper},
    parts::{ComponentPart, DynamicAttrPart, ExpressionPart, Part},
    utils::{get_expr_from_jsx_name, is_component},
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

    fn get_component_props_expr(attrs: &[JSXAttrOrSpread]) -> Expr {
        let mut props: Vec<PropOrSpread> = vec![];

        for attr in attrs {
            match attr {
                JSXAttrOrSpread::JSXAttr(jsx_attr) => {
                    let key = Self::get_attr_name_as_str(&jsx_attr.name);
                    let value_expr = match jsx_attr.value.as_ref() {
                        None => Expr::Lit(Lit::Bool(Bool {
                            span: DUMMY_SP,
                            value: true,
                        })),
                        Some(JSXAttrValue::Str(str_lit)) => Expr::Lit(Lit::Str(str_lit.clone())),
                        Some(JSXAttrValue::JSXExprContainer(expr_container)) => {
                            match &expr_container.expr {
                                JSXExpr::Expr(expr) => *expr.clone(),
                                JSXExpr::JSXEmptyExpr(_) => {
                                    Expr::Lit(Lit::Null(Null { span: DUMMY_SP }))
                                }
                            }
                        }
                        Some(JSXAttrValue::JSXElement(el)) => Expr::JSXElement(el.clone()),
                        Some(JSXAttrValue::JSXFragment(fragment)) => {
                            Expr::JSXFragment(fragment.clone())
                        }
                    };

                    props.push(PropOrSpread::Prop(Box::new(Prop::KeyValue(KeyValueProp {
                        key: PropName::Str(Str {
                            span: DUMMY_SP,
                            value: key.into(),
                            raw: None,
                        }),
                        value: Box::new(value_expr),
                    }))));
                }
                JSXAttrOrSpread::SpreadElement(spread) => {
                    props.push(PropOrSpread::Spread(spread.clone()));
                }
            }
        }

        Expr::Object(ObjectLit {
            span: DUMMY_SP,
            props,
        })
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

    pub fn transform_element(node: &JSXElement, ctx: &mut Context, is_root: bool) {
        let opening = &node.opening;
        let name = &opening.name;

        if !is_component(name) && matches!(name, JSXElementName::Ident(_)) {
            println!("element");
            if let JSXElementName::Ident(element_name) = name {
                let pre_element_length = ctx.node_path_instructions.len();
                if is_root {
                    ctx.node_path_instructions.mark(PathInstructionKind::First);
                }

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

                    Self::transform_element_child(children, ctx);
                }

                ctx.node_path_instructions.truncate(pre_child_length);
                write!(&mut ctx.html, "</{}>", element_name.sym);

                ctx.node_path_instructions.truncate(pre_element_length);
            }
        } else {
            if is_root {
                ctx.node_path_instructions.mark(PathInstructionKind::First);
            }

            Self::transform_component(node, ctx);
        }
    }

    pub fn transform_component(node: &JSXElement, ctx: &mut Context) {
        let key = ctx.counter.increase();
        let opening = &node.opening;

        write!(&mut ctx.html, "<!{}/>", key);
        println!("PATH: {}", ctx.node_path_instructions.to_string());
        ctx.parts.push(Part::ComponentPart(ComponentPart {
            expr: get_expr_from_jsx_name(opening.name.clone()),
            path: ctx.node_path_instructions.clone(),
            props: Self::get_component_props_expr(&opening.attrs),
        }));
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
                Self::transform_element(&element, ctx, false);
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
    ) -> Vec<Stmt> {
        let mut stats: Vec<Stmt> = vec![];
        let mut effects: Vec<Stmt> = vec![];
        let mut path_cache: HashMap<String, Ident> = HashMap::new();

        ctx.parts.sort_by(|a, b| a.path_len().cmp(&b.path_len()));

        for part in &ctx.parts {
            let key = part.path().to_string();

            let node_var = if let Some(cached_ident) = path_cache.get(&key) {
                cached_ident.clone()
            } else {
                let mut best_parent_path = String::new();
                for cached_path in path_cache.keys() {
                    if key.starts_with(cached_path) && cached_path.len() > best_parent_path.len() {
                        best_parent_path = cached_path.clone();
                    }
                }

                let source_ident = if best_parent_path.is_empty() {
                    ctx.root_var.clone()
                } else {
                    path_cache
                        .get(&best_parent_path)
                        .expect("Path must exist in cache")
                        .clone()
                };

                let relative_path = &key[best_parent_path.len()..];

                if relative_path.is_empty() {
                    path_cache.insert(key.clone(), source_ident.clone());
                    source_ident
                } else {
                    let new_node_ident = ASTHelper::generate_ident("$$_node".to_string(), counter);

                    stats.push(ASTHelper::create_walker(
                        &new_node_ident,
                        &source_ident,
                        relative_path,
                        import_manager,
                    ));

                    path_cache.insert(key.clone(), new_node_ident.clone());
                    new_node_ident
                }
            };

            match part {
                Part::ComponentPart(component) => {
                    let range_var = ASTHelper::generate_ident("range".to_owned(), counter);

                    effects.push(ASTHelper::create_range(
                        &range_var,
                        &node_var,
                        import_manager,
                    ));

                    effects.push(ASTHelper::create_component(
                        &range_var,
                        &ctx.ctx_var,
                        &component.expr,
                        &component.props,
                        import_manager,
                    ));
                }

                Part::Expression(part) => {
                    let range_var = ASTHelper::generate_ident("range".to_owned(), counter);

                    effects.push(ASTHelper::create_range(
                        &range_var,
                        &node_var,
                        import_manager,
                    ));

                    effects.push(ASTHelper::create_text(
                        &range_var,
                        &ctx.ctx_var,
                        &part.expr,
                        import_manager,
                    ));
                }

                _ => {}
            }
        }

        stats.extend(effects);
        stats
    }
}
