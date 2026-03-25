use swc_common::util::take::Take;
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
                Transformer::transform_element(element, &mut context, true);
                let hydaration_stmts = Transformer::generate_hydration(
                    &mut context,
                    &mut self.counter,
                    &mut self.import_helper,
                );
                let renderer_fn =
                    ASTHelper::render_fn(hydaration_stmts, &mut context, &mut self.import_helper);
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

        let mut imports = Vec::new();
        let mut templates = Vec::new();
        let mut rest_of_body = Vec::new();

        for item in node.body.take() {
            if item.is_module_decl() {
                imports.push(item);
            } else {
                rest_of_body.push(item);
            }
        }

        for ctx in &self.contexts {
            let template = ASTHelper::create_template(&ctx.html, &mut self.import_helper);
            let template_decl = ASTHelper::const_decl(&ctx.template_var, template);
            templates.push(swc_ecma_ast::ModuleItem::Stmt(template_decl));

            for (template_var, html) in &ctx.extra_templates {
                let template = ASTHelper::create_template(html, &mut self.import_helper);
                let template_decl = ASTHelper::const_decl(template_var, template);
                templates.push(swc_ecma_ast::ModuleItem::Stmt(template_decl));
            }
        }

        let mut final_body = Vec::new();
        if let Some(compiler_import) = self.import_helper.to_import_decl("@rumious/core") {
            final_body.push(compiler_import);
        }

        final_body.extend(imports);
        final_body.extend(templates);
        final_body.extend(rest_of_body);

        node.body = final_body;
    }
}
