use swc_common::sync::Lrc;
use swc_common::{DUMMY_SP, SourceMap, SyntaxContext};
use swc_core::ecma::{
    codegen::{Config, Emitter, text_writer::JsWriter},
    utils::quote_ident,
};
use swc_ecma_ast::{
    ArrowExpr, BindingIdent, BlockStmtOrExpr, CallExpr, Callee, Decl, ExportDecl, Expr,
    ExprOrSpread, ExprStmt, Ident, ImportDecl, ImportNamedSpecifier, ImportPhase, ImportSpecifier,
    KeyValueProp, Lit, Module, ModuleDecl, ModuleItem, Null, ObjectLit, Pat, Prop, PropName,
    PropOrSpread, Stmt, Str, VarDecl, VarDeclKind, VarDeclarator,
};

use crate::configs::import::{RUMIOUS_CORE_PKG, RUMIOUS_ROUTER_PKG};
use crate::router::metadata::{LayoutMetadata, PageMetadata, RouteMetadata};

pub struct RouteGenerator {}

impl RouteGenerator {
    pub fn new() -> Self {
        Self {}
    }

    fn create_named_import(src: &str, names: Vec<&str>) -> ModuleItem {
        ModuleItem::ModuleDecl(ModuleDecl::Import(ImportDecl {
            span: DUMMY_SP,
            specifiers: names
                .into_iter()
                .map(|name| {
                    ImportSpecifier::Named(ImportNamedSpecifier {
                        span: DUMMY_SP,
                        local: quote_ident!(name).into(),
                        imported: None,
                        is_type_only: false,
                    })
                })
                .collect(),
            src: Box::new(Str {
                span: DUMMY_SP,
                value: src.into(),
                raw: None,
            }),
            type_only: false,
            with: None,
            phase: ImportPhase::Evaluation,
        }))
    }

    fn generate_lazy_load(expr: Expr) -> Expr {
        Expr::Call(CallExpr {
            span: DUMMY_SP,
            ctxt: SyntaxContext::empty(),
            callee: Callee::Expr(quote_ident!("lazy").into()),
            args: vec![ExprOrSpread {
                spread: None,
                expr: ArrowExpr {
                    span: DUMMY_SP,
                    ctxt: SyntaxContext::empty(),
                    params: vec![],
                    body: BlockStmtOrExpr::Expr(expr.into()).into(),
                    is_async: false,
                    is_generator: false,
                    type_params: None,
                    return_type: None,
                }
                .into(),
            }],

            type_args: None,
        })
    }

    fn generate_import_expr(path: &str) -> Expr {
        CallExpr {
            span: DUMMY_SP,
            ctxt: SyntaxContext::empty(),
            callee: Callee::Expr(quote_ident!("import").into()),
            args: vec![ExprOrSpread {
                expr: Str {
                    span: DUMMY_SP,
                    value: path.into(),
                    raw: None,
                }
                .into(),
                spread: None,
            }],
            type_args: None,
        }
        .into()
    }

    fn generate_route_layouts(layouts: Vec<LayoutMetadata>) -> Expr {
        ObjectLit {
            span: DUMMY_SP,
            props: layouts
                .iter()
                .map(|l| {
                    PropOrSpread::Prop(Box::new(Prop::KeyValue(KeyValueProp {
                        key: PropName::Str(Str {
                            span: DUMMY_SP,
                            value: l.key.clone().into(),
                            raw: None,
                        }),
                        value: Box::new(RouteGenerator::generate_lazy_load(
                            RouteGenerator::generate_import_expr(&l.import_path),
                        )),
                    })))
                })
                .collect(),
        }
        .into()
    }

    fn generate_route_pages(pages: Vec<PageMetadata>) -> Expr {
        ObjectLit {
            span: DUMMY_SP,
            props: pages
                .iter()
                .map(|p| {
                    PropOrSpread::Prop(Box::new(Prop::KeyValue(KeyValueProp {
                        key: PropName::Str(Str {
                            span: DUMMY_SP,
                            value: p.path.clone().into(),
                            raw: None,
                        }),
                        value: Box::new(
                            ObjectLit {
                                span: DUMMY_SP,
                                props: vec![
                                    PropOrSpread::Prop(Box::new(Prop::KeyValue(KeyValueProp {
                                        key: quote_ident!("component").into(),
                                        value: Box::new(RouteGenerator::generate_lazy_load(
                                            RouteGenerator::generate_import_expr(&p.import_path),
                                        )),
                                    }))),
                                    PropOrSpread::Prop(Box::new(Prop::KeyValue(KeyValueProp {
                                        key: quote_ident!("layouts").into(),
                                        value: Box::new(Expr::Array(swc_ecma_ast::ArrayLit {
                                            span: DUMMY_SP,
                                            elems: p
                                                .layout
                                                .iter()
                                                .map(|l_key| {
                                                    Some(ExprOrSpread {
                                                        spread: None,
                                                        expr: Box::new(
                                                            Lit::Str(Str {
                                                                span: DUMMY_SP,
                                                                value: l_key.clone().into(),
                                                                raw: None,
                                                            })
                                                            .into(),
                                                        ),
                                                    })
                                                })
                                                .collect(),
                                        })),
                                    }))),
                                ],
                            }
                            .into(),
                        ),
                    })))
                })
                .collect(),
        }
        .into()
    }

    fn get_key_from_path(path: &String) -> String {
        path.trim_start_matches('/')
            .replace(".page.ts", "")
            .replace(".layout.ts", "")
            .replace(".tsx", "")
            .replace(".ts", "")
            .replace("/", "_")
            .replace(".", "_")
            .replace("[", ":")
            .replace("]", "")
    }

    fn extract_metadata(paths: Vec<String>, route_dir: &String) -> Result<RouteMetadata, String> {
        let mut pages: Vec<PageMetadata> = vec![];
        let mut layouts = vec![];

        paths
            .iter()
            .filter(|p| p.ends_with(".layout.ts"))
            .for_each(|p| {
                let layout_path = p
                    .strip_suffix(".layout.ts")
                    .unwrap_or(&p)
                    .replace("index", "_root_layout");

                let key = RouteGenerator::get_key_from_path(&layout_path);
                layouts.push(LayoutMetadata {
                    path: layout_path.into(),
                    key: key,
                    import_path: format!("@routes{}", p),
                    original_path: p.clone(),
                });
            });

        paths
            .iter()
            .filter(|p| p.ends_with(".page.ts"))
            .for_each(|p| {
                let page_path = p
                    .strip_suffix(".page.ts")
                    .unwrap_or(&p)
                    .replace("index", "")
                    .replace("[", ":")
                    .replace("]", "");

                let page_dir = std::path::Path::new(p)
                    .parent()
                    .unwrap_or(std::path::Path::new(""))
                    .to_str()
                    .unwrap_or("");

                let mut page_layouts: Vec<String> = vec![];

                for l in &layouts {
                    let layout_dir = std::path::Path::new(&l.original_path)
                        .parent()
                        .unwrap_or(std::path::Path::new(""))
                        .to_str()
                        .unwrap_or("");

                    if page_dir.starts_with(layout_dir) {
                        page_layouts.push(l.key.clone());
                    }
                }

                pages.push(PageMetadata {
                    path: page_path,
                    layout: page_layouts,
                    import_path: format!("@routes{}", p),
                });
            });

        Result::Ok(RouteMetadata { layouts, pages })
    }

    fn generate_ast(paths: Vec<String>, route_dir: String) -> Module {
        let metadata = RouteGenerator::extract_metadata(paths, &route_dir).expect("Error");

        Module {
            span: DUMMY_SP,
            body: vec![
                RouteGenerator::create_named_import(RUMIOUS_CORE_PKG, vec!["lazy"]),
                ModuleItem::ModuleDecl(ModuleDecl::ExportDecl(ExportDecl {
                    span: DUMMY_SP,
                    decl: Decl::Var(Box::new(VarDecl {
                        span: DUMMY_SP,
                        ctxt: SyntaxContext::empty(),
                        kind: VarDeclKind::Const,
                        declare: false,
                        decls: vec![VarDeclarator {
                            span: DUMMY_SP,
                            name: BindingIdent {
                                id: quote_ident!("RouteLayouts").into(),
                                type_ann: None,
                            }
                            .into(),
                            init: Some(Box::new(RouteGenerator::generate_route_layouts(
                                metadata.layouts,
                            ))),
                            definite: false,
                        }],
                    })),
                })),
                ModuleItem::ModuleDecl(ModuleDecl::ExportDecl(ExportDecl {
                    span: DUMMY_SP,
                    decl: Decl::Var(Box::new(VarDecl {
                        span: DUMMY_SP,
                        ctxt: SyntaxContext::empty(),
                        kind: VarDeclKind::Const,
                        declare: false,
                        decls: vec![VarDeclarator {
                            span: DUMMY_SP,
                            name: BindingIdent {
                                id: quote_ident!("RoutePages").into(),
                                type_ann: None,
                            }
                            .into(),
                            init: Some(Box::new(RouteGenerator::generate_route_pages(
                                metadata.pages,
                            ))),
                            definite: false,
                        }],
                    })),
                })),
            ],
            shebang: None,
        }
    }

    pub fn generate(paths: Vec<String>, route_dir: String) -> Result<String, String> {
        let ast = RouteGenerator::generate_ast(paths, route_dir);
        let mut buf = Vec::new();
        let cm = Lrc::new(SourceMap::default());

        {
            let mut emitter = Emitter {
                cfg: Config::default().with_minify(false),
                cm: cm.clone(),
                comments: None,
                wr: Box::new(JsWriter::new(cm.clone(), "\n", &mut buf, None)),
            };

            emitter.emit_module(&ast).unwrap();
        }

        Result::Ok(String::from_utf8(buf).expect("Invalid code format"))
    }
}
