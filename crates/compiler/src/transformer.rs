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

use swc_common::{DUMMY_SP, SyntaxContext, cache};
use swc_ecma_ast::{
    ArrayLit, BlockStmtOrExpr, Bool, Expr, ExprOrSpread, Ident, JSXAttrName, JSXAttrOrSpread,
    JSXAttrValue,
    JSXElement, JSXElementChild, JSXElementName, JSXExpr, JSXExprContainer, JSXFragment, JSXText,
    KeyValueProp, Lit, Null, ObjectLit, Prop, PropName, PropOrSpread, Stmt, Str,
};

use crate::{
    context::{Context, Counter, Path, PathInstruction, PathInstructionKind},
    deps_extractor::DepsExtractor,
    helpers::{ASTHelper, ImportHelper},
    parts::{
        ComponentPart, DynamicAttrPart, EventHandlerPart, ExpressionPart, ForComponentPart,
        IfComponentPart, Part,
    },
    utils::{
        get_expr_from_jsx_name, is_component, is_for_component, is_fragment_component,
        is_if_component,
    },
};

pub struct Transformer;

impl Transformer {
    fn is_event_attr(name: &str) -> bool {
        name.starts_with("on") && name.len() > 2 && name.chars().nth(2).unwrap().is_uppercase()
    }

    fn get_event_name(name: &str) -> String {
        // Convert "onClick" to "click"
        if Self::is_event_attr(name) {
            let mut result = String::new();
            for (i, c) in name[2..].chars().enumerate() {
                if i == 0 {
                    result.push(c.to_lowercase().next().unwrap());
                } else if c.is_uppercase() {
                    result.push('-');
                    result.push(c.to_lowercase().next().unwrap());
                } else {
                    result.push(c);
                }
            }
            result
        } else {
            name.to_string()
        }
    }
    fn transform_fragment_children(children: &[JSXElementChild], ctx: &mut Context, is_root: bool) {
        let pre_child_length = ctx.node_path_instructions.len();

        for (index, child) in children.iter().enumerate() {
            if is_root {
                if index == 0 {
                    ctx.node_path_instructions.mark(PathInstructionKind::First);
                } else {
                    ctx.node_path_instructions
                        .mark(PathInstructionKind::Sibling);
                }
            } else if index > 0 {
                ctx.node_path_instructions
                    .mark(PathInstructionKind::Sibling);
            }

            Self::transform_element_child(child, ctx);
        }

        ctx.node_path_instructions.truncate(pre_child_length);
    }

    fn transform_fragment(node: &JSXElement, ctx: &mut Context, is_root: bool) {
        Self::transform_fragment_children(&node.children, ctx, is_root);
    }

    fn create_renderer_from_jsx_element(
        element: &JSXElement,
        owner_ctx: &mut Context,
        counter: &mut Counter,
        import_manager: &mut ImportHelper,
    ) -> Expr {
        let mut child_ctx = Context::new(counter);
        Self::transform_element(element, &mut child_ctx, true);

        let hydration = Self::generate_hydration(&mut child_ctx, counter, import_manager);

        owner_ctx
            .extra_templates
            .push((child_ctx.template_var.clone(), child_ctx.html.clone()));
        owner_ctx
            .extra_templates
            .extend(child_ctx.extra_templates.clone());

        let renderer_fn = ASTHelper::render_fn(hydration, &mut child_ctx, import_manager);
        ASTHelper::create_renderer(renderer_fn, import_manager)
    }

    fn create_renderer_from_jsx_fragment(
        fragment: &JSXFragment,
        owner_ctx: &mut Context,
        counter: &mut Counter,
        import_manager: &mut ImportHelper,
    ) -> Expr {
        let mut child_ctx = Context::new(counter);
        Self::transform_fragment_children(&fragment.children, &mut child_ctx, true);

        let hydration = Self::generate_hydration(&mut child_ctx, counter, import_manager);

        owner_ctx
            .extra_templates
            .push((child_ctx.template_var.clone(), child_ctx.html.clone()));
        owner_ctx
            .extra_templates
            .extend(child_ctx.extra_templates.clone());

        let renderer_fn = ASTHelper::render_fn(hydration, &mut child_ctx, import_manager);
        ASTHelper::create_renderer(renderer_fn, import_manager)
    }

    fn transform_component_prop_expr(
        expr: &Expr,
        owner_ctx: &mut Context,
        counter: &mut Counter,
        import_manager: &mut ImportHelper,
    ) -> Expr {
        match expr {
            Expr::JSXElement(element) => {
                Self::create_renderer_from_jsx_element(element, owner_ctx, counter, import_manager)
            }
            Expr::JSXFragment(fragment) => Self::create_renderer_from_jsx_fragment(
                fragment,
                owner_ctx,
                counter,
                import_manager,
            ),
            Expr::Array(array) => Expr::Array(ArrayLit {
                span: array.span,
                elems: array
                    .elems
                    .iter()
                    .map(|item| {
                        item.as_ref().map(|expr_or_spread| ExprOrSpread {
                            spread: expr_or_spread.spread,
                            expr: Box::new(Self::transform_component_prop_expr(
                                &expr_or_spread.expr,
                                owner_ctx,
                                counter,
                                import_manager,
                            )),
                        })
                    })
                    .collect(),
            }),
            Expr::Object(obj) => {
                let mut props = Vec::with_capacity(obj.props.len());

                for prop in &obj.props {
                    match prop {
                        PropOrSpread::Prop(prop) => match &**prop {
                            Prop::KeyValue(kv) => props.push(PropOrSpread::Prop(Box::new(
                                Prop::KeyValue(KeyValueProp {
                                    key: kv.key.clone(),
                                    value: Box::new(Self::transform_component_prop_expr(
                                        &kv.value,
                                        owner_ctx,
                                        counter,
                                        import_manager,
                                    )),
                                }),
                            ))),
                            _ => props.push(PropOrSpread::Prop(prop.clone())),
                        },
                        PropOrSpread::Spread(spread) => {
                            props.push(PropOrSpread::Spread(swc_ecma_ast::SpreadElement {
                                dot3_token: spread.dot3_token,
                                expr: Box::new(Self::transform_component_prop_expr(
                                    &spread.expr,
                                    owner_ctx,
                                    counter,
                                    import_manager,
                                )),
                            }))
                        }
                    }
                }

                Expr::Object(ObjectLit {
                    span: obj.span,
                    props,
                })
            }
            _ => expr.clone(),
        }
    }

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

    fn get_component_prop_expr(attrs: &[JSXAttrOrSpread], prop_name: &str) -> Option<Expr> {
        for attr in attrs {
            if let JSXAttrOrSpread::JSXAttr(jsx_attr) = attr {
                if Self::get_attr_name_as_str(&jsx_attr.name) == prop_name {
                    return Some(match jsx_attr.value.as_ref() {
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
                    });
                }
            }
        }

        None
    }

    fn extract_if_condition_deps(condition: &Expr) -> Vec<Expr> {
        match condition {
            Expr::Arrow(arrow) => match &*arrow.body {
                BlockStmtOrExpr::Expr(expr) => DepsExtractor::extract(expr),
                BlockStmtOrExpr::BlockStmt(block) => {
                    let mut deps: Vec<Expr> = vec![];
                    for stmt in &block.stmts {
                        if let Stmt::Return(return_stmt) = stmt {
                            if let Some(arg) = &return_stmt.arg {
                                deps.extend(DepsExtractor::extract(arg));
                            }
                        }
                    }
                    deps
                }
            },
            Expr::Fn(fn_expr) => {
                let mut deps: Vec<Expr> = vec![];
                if let Some(body) = &fn_expr.function.body {
                    for stmt in &body.stmts {
                        if let Stmt::Return(return_stmt) = stmt {
                            if let Some(arg) = &return_stmt.arg {
                                deps.extend(DepsExtractor::extract(arg));
                            }
                        }
                    }
                }
                deps
            }
            _ => DepsExtractor::extract(condition),
        }
    }

    pub fn transform_attr(node: &JSXAttrOrSpread, ctx: &mut Context) {
        match node {
            JSXAttrOrSpread::JSXAttr(attr) => {
                let name = Self::get_attr_name_as_str(&attr.name);
                let value = attr.value.as_ref().expect("Cannot get attr value");

                match value {
                    JSXAttrValue::Str(str) => {
                        if !Self::is_event_attr(&name) {
                            write!(
                                &mut ctx.html,
                                "{}=\"{}\" ",
                                name,
                                str.value.as_str().expect("Cannot get attr value")
                            );
                        }
                    }

                    JSXAttrValue::JSXExprContainer(expr_container) => {
                        let expr = Self::get_attr_value_as_expr(value);
                        let deps = DepsExtractor::extract(&expr);

                        if Self::is_event_attr(&name) {
                            let event_name = Self::get_event_name(&name);
                            ctx.parts.push(Part::EventHandler(EventHandlerPart {
                                event_name,
                                expr,
                                path: ctx.node_path_instructions.clone(),
                                deps,
                            }));
                        } else {
                            ctx.parts.push(Part::DynamicAttr(DynamicAttrPart {
                                name: name.clone(),
                                expr,
                                path: ctx.node_path_instructions.clone(),
                                deps,
                            }));
                        }
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

        if is_fragment_component(name) {
            Self::transform_fragment(node, ctx, is_root);
            return;
        }

        if is_if_component(name) {
            Self::transform_if_component(node, ctx);
            return;
        }

        if is_for_component(name) {
            Self::transform_for_component(node, ctx);
            return;
        }

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

    pub fn transform_for_component(node: &JSXElement, ctx: &mut Context) {
        let key = ctx.counter.increase();
        let opening = &node.opening;

        write!(&mut ctx.html, "<!{}/>", key);
        println!("PATH: {}", ctx.node_path_instructions.to_string());
        ctx.parts.push(Part::ForComponentPart(ForComponentPart {
            path: ctx.node_path_instructions.clone(),
            props: Self::get_component_props_expr(&opening.attrs),
        }));
    }

    pub fn transform_if_component(node: &JSXElement, ctx: &mut Context) {
        let key = ctx.counter.increase();
        let opening = &node.opening;

        write!(&mut ctx.html, "<!{}/>", key);
        println!("PATH: {}", ctx.node_path_instructions.to_string());

        if !node.children.is_empty() {
            panic!("If component does not accept JSX children. Use child={{Func}}.");
        }

        let condition = Self::get_component_prop_expr(&opening.attrs, "condition")
            .expect("If component requires a condition prop");
        let child = Self::get_component_prop_expr(&opening.attrs, "child")
            .expect("If component requires a child prop, e.g. child={MyComponent}");
        let deps = Self::extract_if_condition_deps(&condition);
        let fallback = Self::get_component_prop_expr(&opening.attrs, "fallback");

        ctx.parts.push(Part::IfComponentPart(IfComponentPart {
            path: ctx.node_path_instructions.clone(),
            condition,
            child,
            fallback,
            deps,
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
                let deps = DepsExtractor::extract(expr);
                ctx.parts.push(Part::Expression(ExpressionPart {
                    expr: expr.clone(),
                    path: ctx.node_path_instructions.clone(),
                    deps,
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

        let parts = ctx.parts.clone();

        for part in &parts {
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
                    let props = Self::transform_component_prop_expr(
                        &component.props,
                        ctx,
                        counter,
                        import_manager,
                    );

                    effects.push(ASTHelper::create_component(
                        &node_var,
                        &ctx.ctx_var,
                        &component.expr,
                        &props,
                        import_manager,
                    ));
                }

                Part::ForComponentPart(component) => {
                    let props = Self::transform_component_prop_expr(
                        &component.props,
                        ctx,
                        counter,
                        import_manager,
                    );

                    effects.push(ASTHelper::create_for_component(
                        &node_var,
                        &ctx.ctx_var,
                        &props,
                        import_manager,
                    ));
                }

                Part::IfComponentPart(component) => {
                    let then_branch = Self::transform_component_prop_expr(
                        &component.child,
                        ctx,
                        counter,
                        import_manager,
                    );

                    let fallback_branch = match &component.fallback {
                        Some(expr) => {
                            Self::transform_component_prop_expr(expr, ctx, counter, import_manager)
                        }
                        None => Expr::Lit(Lit::Null(Null { span: DUMMY_SP })),
                    };

                    effects.push(ASTHelper::create_if_component(
                        &node_var,
                        &ctx.ctx_var,
                        &component.condition,
                        &then_branch,
                        &fallback_branch,
                        &component.deps,
                        import_manager,
                    ));
                }

                Part::DynamicAttr(attr) => {
                    effects.push(ASTHelper::create_attr(
                        &node_var,
                        &attr.name,
                        &ctx.ctx_var,
                        &attr.expr,
                        &attr.deps,
                        import_manager,
                    ));
                }

                Part::Expression(part) => {
                    effects.push(ASTHelper::create_text(
                        &node_var,
                        &ctx.ctx_var,
                        &part.expr,
                        &part.deps,
                        import_manager,
                    ));
                }

                Part::EventHandler(event) => {
                    effects.push(ASTHelper::create_event(
                        &node_var,
                        &event.event_name,
                        &ctx.ctx_var,
                        &event.expr,
                        &event.deps,
                        import_manager,
                    ));
                }
            }
        }

        stats.extend(effects);
        stats
    }
}
