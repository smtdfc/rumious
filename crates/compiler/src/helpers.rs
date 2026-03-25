use std::{collections::HashMap, vec};

use swc_common::{DUMMY_SP, SyntaxContext};
use swc_core::ecma::utils::{ExprFactory, private_ident, quote_ident};
use swc_ecma_ast::{
    ArrayLit, ArrowExpr, BindingIdent, BlockStmt, BlockStmtOrExpr, CallExpr, Decl, Expr,
    ExprOrSpread, ExprStmt, Id, Ident, ImportDecl, ImportNamedSpecifier, ImportSpecifier, Lit,
    MemberExpr, MemberProp, ModuleDecl, ModuleExportName, ModuleItem, Pat, ReturnStmt, Stmt, Str,
    VarDecl, VarDeclKind, VarDeclarator,
};

use crate::context::{Context, Counter};

pub struct ImportHelper {
    names: HashMap<String, Ident>,
    alias_counter: u64,
}

impl ImportHelper {
    pub fn new() -> Self {
        Self {
            names: HashMap::new(),
            alias_counter: 0,
        }
    }

    fn next_alias(&mut self) -> Ident {
        self.alias_counter += 1;
        Ident::new(
            format!("$$__r{}", self.alias_counter).into(),
            DUMMY_SP,
            SyntaxContext::empty(),
        )
    }

    pub fn get(&mut self, name: &str) -> Ident {
        if let Some(existing) = self.names.get(name) {
            return existing.clone();
        }

        let alias = self.next_alias();
        self.names.insert(name.to_string(), alias.clone());
        alias
    }

    pub fn to_import_decl(&self, src_path: &str) -> Option<ModuleItem> {
        if self.names.is_empty() {
            return None;
        }

        let mut specifiers: Vec<ImportSpecifier> = self
            .names
            .iter()
            .map(|(imported_name, local_alias)| {
                ImportSpecifier::Named(ImportNamedSpecifier {
                    span: DUMMY_SP,
                    local: local_alias.clone(),
                    imported: Some(ModuleExportName::Ident(Ident::new(
                        imported_name.clone().into(),
                        DUMMY_SP,
                        SyntaxContext::empty(),
                    ))),
                    is_type_only: false,
                })
            })
            .collect();

        specifiers.sort_by(|a, b| {
            let name_a = if let ImportSpecifier::Named(n) = a {
                &n.local.sym
            } else {
                ""
            };
            let name_b = if let ImportSpecifier::Named(n) = b {
                &n.local.sym
            } else {
                ""
            };
            name_a.cmp(name_b)
        });

        Some(ModuleItem::ModuleDecl(ModuleDecl::Import(ImportDecl {
            span: DUMMY_SP,
            specifiers,
            src: Box::new(Str {
                span: DUMMY_SP,
                value: src_path.into(),
                raw: None,
            }),
            type_only: false,
            with: None,
            phase: Default::default(),
        })))
    }
}
pub struct ASTHelper {}

impl ASTHelper {
    pub fn generate_ident(prefix: String, counter: &mut Counter) -> Ident {
        private_ident!(format!("{}_{}", prefix, counter.increase()))
    }

    pub fn create_root(ctx: &mut Context, import_manager: &mut ImportHelper) -> Stmt {
        let create_root_fn = import_manager.get("$$createRoot");
        Self::const_decl(
            &ctx.root_var,
            Expr::Call(CallExpr {
                span: DUMMY_SP,
                ctxt: SyntaxContext::empty(),
                callee: create_root_fn.as_callee(),
                args: vec![ctx.template_var.clone().as_arg()],
                type_args: None,
            }),
        )
    }

    pub fn create_fragment(ctx: &mut Context) -> Stmt {
        Self::const_decl(
            &ctx.frag_var,
            Expr::Call(CallExpr {
                span: DUMMY_SP,
                ctxt: SyntaxContext::empty(),
                callee: MemberExpr {
                    span: DUMMY_SP,
                    obj: quote_ident!("document").into(),
                    prop: quote_ident!("createDocumentFragment").into(),
                }
                .as_callee(),
                args: vec![],
                type_args: None,
            }),
        )
    }

    pub fn render_fn(
        stats: Vec<Stmt>,
        ctx: &mut Context,
        import_manager: &mut ImportHelper,
    ) -> ArrowExpr {
        ArrowExpr {
            span: DUMMY_SP,
            ctxt: SyntaxContext::empty(),
            params: vec![Pat::Ident(BindingIdent {
                id: ctx.ctx_var.clone(),
                type_ann: None,
            })],
            body: Box::new(BlockStmtOrExpr::BlockStmt(BlockStmt {
                span: DUMMY_SP,
                ctxt: SyntaxContext::empty(),
                stmts: {
                    let mut all_stats = vec![
                        Self::create_fragment(ctx),
                        Self::create_root(ctx, import_manager),
                    ];

                    all_stats.extend(stats);

                    all_stats.push(Stmt::Expr(ExprStmt {
                        span: DUMMY_SP,
                        expr: Box::new(Expr::Call(CallExpr {
                            span: DUMMY_SP,
                            ctxt: SyntaxContext::empty(),

                            callee: MemberExpr {
                                span: DUMMY_SP,
                                obj: Box::new(Expr::Ident(ctx.frag_var.clone())),
                                prop: MemberProp::Ident(
                                    Ident::new(
                                        "appendChild".into(),
                                        DUMMY_SP,
                                        SyntaxContext::empty(),
                                    )
                                    .into(),
                                ),
                            }
                            .as_callee(),
                            args: vec![ExprOrSpread {
                                spread: None,
                                expr: Box::new(Expr::Ident(ctx.root_var.clone())),
                            }],
                            type_args: None,
                        })),
                    }));
                    all_stats.push(Stmt::Return(ReturnStmt {
                        span: DUMMY_SP,
                        arg: Some(Expr::Ident(ctx.frag_var.clone()).into()),
                    }));
                    all_stats
                },
            })),
            is_async: false,
            is_generator: false,
            type_params: None,
            return_type: None,
        }
    }

    pub fn create_renderer(renderer_fn: ArrowExpr, import_manager: &mut ImportHelper) -> Expr {
        let create_renderer_fn = import_manager.get("$$createRenderer");
        Expr::Call(CallExpr {
            span: DUMMY_SP,
            ctxt: SyntaxContext::empty(),
            callee: create_renderer_fn.as_callee(),
            args: vec![renderer_fn.as_arg()],
            type_args: None,
        })
    }

    pub fn const_decl(ident: &Ident, expr: Expr) -> Stmt {
        VarDecl {
            span: DUMMY_SP,
            kind: VarDeclKind::Const,
            decls: vec![VarDeclarator {
                span: DUMMY_SP,
                name: ident.clone().into(),
                init: Some(expr.into()),
                definite: false,
            }],
            declare: false,
            ctxt: SyntaxContext::empty(),
        }
        .into()
    }

    pub fn create_template(html: &str, import_manager: &mut ImportHelper) -> Expr {
        let create_template_fn = import_manager.get("$$createTemplate");
        Expr::Call(CallExpr {
            span: DUMMY_SP,
            ctxt: SyntaxContext::empty(),
            callee: create_template_fn.as_callee(),
            args: vec![
                Lit::Str(Str {
                    span: DUMMY_SP,
                    value: html.into(),
                    raw: None,
                })
                .as_arg(),
            ],
            type_args: None,
        })
    }

    pub fn create_walker(
        node: &Ident,
        source: &Ident,
        path: &str,
        import_manager: &mut ImportHelper,
    ) -> Stmt {
        let create_template_fn = import_manager.get("$$walk");
        Self::const_decl(
            node,
            Expr::Call(CallExpr {
                span: DUMMY_SP,
                ctxt: SyntaxContext::empty(),
                callee: create_template_fn.as_callee(),
                args: vec![
                    source.clone().as_arg(),
                    Lit::Str(Str {
                        span: DUMMY_SP,
                        value: path.into(),
                        raw: None,
                    })
                    .as_arg(),
                ],
                type_args: None,
            }),
        )
    }

    pub fn create_effect(
        stmts: Vec<Stmt>,
        ctx_var: &Ident,
        import_manager: &mut ImportHelper,
    ) -> Stmt {
        let create_template_fn = import_manager.get("$$effect");

        let arrow_fn = ArrowExpr {
            span: DUMMY_SP,
            params: vec![],
            body: Box::new(BlockStmtOrExpr::BlockStmt(BlockStmt {
                span: DUMMY_SP,
                stmts,
                ctxt: SyntaxContext::empty(),
            })),
            is_async: false,
            is_generator: false,
            type_params: None,
            return_type: None,
            ctxt: SyntaxContext::empty(),
        };

        Stmt::Expr(ExprStmt {
            span: DUMMY_SP,
            expr: Box::new(Expr::Call(CallExpr {
                span: DUMMY_SP,
                ctxt: SyntaxContext::empty(),
                callee: create_template_fn.as_callee(),
                args: vec![
                    ExprOrSpread {
                        spread: None,
                        expr: Box::new(Expr::Arrow(arrow_fn)),
                    },
                    Expr::Array(ArrayLit {
                        span: DUMMY_SP,
                        elems: vec![],
                    })
                    .as_arg(),
                    ctx_var.clone().as_arg(),
                ],
                type_args: None,
            })),
        })
    }

    pub fn create_component(
        node: &Ident,
        ctx_var: &Ident,
        expr: &Expr,
        props: &Expr,
        import_manager: &mut ImportHelper,
    ) -> Stmt {
        let create_template_fn = import_manager.get("$$createComponent");
        Stmt::Expr(ExprStmt {
            span: DUMMY_SP,
            expr: Expr::Call(CallExpr {
                span: DUMMY_SP,
                ctxt: SyntaxContext::empty(),
                callee: create_template_fn.as_callee(),
                args: vec![
                    node.clone().as_arg(),
                    ctx_var.clone().as_arg(),
                    expr.clone().as_arg(),
                    props.clone().as_arg(),
                ],
                type_args: None,
            })
            .into(),
        })
    }

    pub fn create_text(
        node: &Ident,
        ctx_var: &Ident,
        expr: &Expr,
        deps: &[Expr],
        import_manager: &mut ImportHelper,
    ) -> Stmt {
        let text_fn = import_manager.get("$$text");

        let deps_elems: Vec<Option<swc_ecma_ast::ExprOrSpread>> = deps
            .iter()
            .map(|dep| {
                Some(swc_ecma_ast::ExprOrSpread {
                    spread: None,
                    expr: Box::new(dep.clone()),
                })
            })
            .collect();

        let expr_fn = Expr::Arrow(ArrowExpr {
            ctxt: SyntaxContext::empty(),
            span: DUMMY_SP,
            params: vec![],
            body: Box::new(BlockStmtOrExpr::Expr(Box::new(expr.clone()))),
            is_async: false,
            is_generator: false,
            type_params: None,
            return_type: None,
        });

        Stmt::Expr(ExprStmt {
            span: DUMMY_SP,
            expr: Expr::Call(CallExpr {
                span: DUMMY_SP,
                ctxt: SyntaxContext::empty(),
                callee: text_fn.as_callee(),
                args: vec![
                    node.clone().as_arg(),
                    ctx_var.clone().as_arg(),
                    expr_fn.as_arg(),
                    swc_ecma_ast::ExprOrSpread {
                        spread: None,
                        expr: Box::new(Expr::Array(ArrayLit {
                            span: DUMMY_SP,
                            elems: deps_elems,
                        })),
                    },
                ],
                type_args: None,
            })
            .into(),
        })
    }

    pub fn create_attr(
        node: &Ident,
        attr_name: &str,
        ctx_var: &Ident,
        expr: &Expr,
        deps: &[Expr],
        import_manager: &mut ImportHelper,
    ) -> Stmt {
        let attr_fn = import_manager.get("$$attr");

        let deps_elems: Vec<Option<swc_ecma_ast::ExprOrSpread>> = deps
            .iter()
            .map(|dep| {
                Some(swc_ecma_ast::ExprOrSpread {
                    spread: None,
                    expr: Box::new(dep.clone()),
                })
            })
            .collect();

        let expr_fn = Expr::Arrow(ArrowExpr {
            ctxt: SyntaxContext::empty(),
            span: DUMMY_SP,
            params: vec![],
            body: Box::new(BlockStmtOrExpr::Expr(Box::new(expr.clone()))),
            is_async: false,
            is_generator: false,
            type_params: None,
            return_type: None,
        });

        Stmt::Expr(ExprStmt {
            span: DUMMY_SP,
            expr: Expr::Call(CallExpr {
                span: DUMMY_SP,
                ctxt: SyntaxContext::empty(),
                callee: attr_fn.as_callee(),
                args: vec![
                    node.clone().as_arg(),
                    Str {
                        span: DUMMY_SP,
                        value: attr_name.into(),
                        raw: None,
                    }
                    .as_arg(),
                    ctx_var.clone().as_arg(),
                    expr_fn.as_arg(),
                    swc_ecma_ast::ExprOrSpread {
                        spread: None,
                        expr: Box::new(Expr::Array(ArrayLit {
                            span: DUMMY_SP,
                            elems: deps_elems,
                        })),
                    },
                ],
                type_args: None,
            })
            .into(),
        })
    }
}
