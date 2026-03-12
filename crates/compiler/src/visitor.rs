use swc_core::ecma::visit::{VisitMut, VisitMutWith};
use swc_ecma_ast::Expr;

use crate::{
    context::{Context, Counter},
    helpers::{ASTHelper, ImportHelper},
    transformer::Transformer,
};

pub struct Visitor {
    contexts: Vec<Context>,
    import_helper: ImportHelper,
    counter: Counter,
}

impl Visitor {
    pub fn new() -> Self {
        Self {
            contexts: vec![],
            import_helper: ImportHelper::new(),
            counter: Counter::new(),
        }
    }
}

impl VisitMut for Visitor {
    fn visit_mut_expr(&mut self, node: &mut Expr) {
        match node {
            Expr::JSXElement(element) => {
                let mut context = Context::new(&mut self.counter);
                Transformer::transform_element(element, &mut context);

                let renderer_fn =
                    ASTHelper::render_fn(vec![], &mut context, &mut self.import_helper);
                *node = ASTHelper::create_renderer(renderer_fn, &mut self.import_helper);
                self.contexts.push(context);
            }
            _ => {
                node.visit_mut_children_with(self);
            }
        }
    }

    fn visit_mut_module(&mut self, node: &mut swc_ecma_ast::Module) {
        node.visit_mut_children_with(self);

        let mut new_items = Vec::new();

        for ctx in &self.contexts {
            let template = ASTHelper::create_template(&ctx.html, &mut self.import_helper);
            let template_decl = ASTHelper::const_decl(&ctx.template_var, template);
            new_items.push(swc_ecma_ast::ModuleItem::Stmt(template_decl));
        }

        new_items.append(&mut node.body);
        if let Some(import_stmt) = self.import_helper.to_import_decl("@rumious/core") {
            new_items.insert(0, import_stmt);
        }

        node.body = new_items;
    }
}
