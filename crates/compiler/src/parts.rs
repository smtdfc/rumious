use swc_ecma_ast::Expr;

use crate::context::PathInstruction;

#[derive(Clone)]
pub struct DynamicAttrPart {
    pub name: String,
    pub expr: Expr,
    pub path: PathInstruction,
    pub deps: Vec<Expr>,
}

impl DynamicAttrPart {}

#[derive(Clone)]
pub struct ExpressionPart {
    pub expr: Expr,
    pub path: PathInstruction,
    pub deps: Vec<Expr>,
}

impl ExpressionPart {}

#[derive(Clone)]
pub struct ComponentPart {
    pub expr: Expr,
    pub path: PathInstruction,
    pub props: Expr,
}

impl ComponentPart {}

#[derive(Clone)]
pub enum Part {
    DynamicAttr(DynamicAttrPart),
    Expression(ExpressionPart),
    ComponentPart(ComponentPart),
}

impl Part {
    pub fn path_len(&self) -> usize {
        match self {
            Part::DynamicAttr(d) => d.path.len(),
            Part::Expression(e) => e.path.len(),
            Part::ComponentPart(c) => c.path.len(),
        }
    }

    pub fn path(&self) -> &PathInstruction {
        match self {
            Part::DynamicAttr(d) => &d.path,
            Part::Expression(e) => &e.path,
            Part::ComponentPart(c) => &c.path,
        }
    }
}
