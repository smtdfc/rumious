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

pub enum Part {
    DynamicAttr(DynamicAttrPart),
    Expression(ExpressionPart),
}

impl Part {
    pub fn path_len(&self) -> usize {
        match self {
            Part::DynamicAttr(d) => d.path.len(),
            Part::Expression(e) => e.path.len(),
        }
    }

    pub fn path(&self) -> &PathInstruction {
        match self {
            Part::DynamicAttr(d) => &d.path,
            Part::Expression(e) => &e.path,
        }
    }
}
