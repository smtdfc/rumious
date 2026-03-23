use swc_ecma_ast::Expr;

use crate::context::{Path, PathInstruction};

pub struct DynamicAttrPart {
    pub expr: Expr,
    pub path: PathInstruction,
    pub deps: Vec<Expr>,
}

impl DynamicAttrPart {}

pub struct ExpressionPart {
    pub expr: Expr,
    pub path: PathInstruction,
    pub deps: Vec<Expr>,
}

impl ExpressionPart {}

pub struct ComponentPart {
    pub expr: Expr,
    pub path: PathInstruction,
    pub props: Expr,
}

impl ComponentPart {}

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
