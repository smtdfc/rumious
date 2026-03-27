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
pub struct EventHandlerPart {
    pub event_name: String,
    pub expr: Expr,
    pub path: PathInstruction,
    pub deps: Vec<Expr>,
}

impl EventHandlerPart {}

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
pub struct ForComponentPart {
    pub path: PathInstruction,
    pub props: Expr,
}

impl ForComponentPart {}

#[derive(Clone)]
pub enum Part {
    DynamicAttr(DynamicAttrPart),
    EventHandler(EventHandlerPart),
    Expression(ExpressionPart),
    ComponentPart(ComponentPart),
    ForComponentPart(ForComponentPart),
}

impl Part {
    pub fn path_len(&self) -> usize {
        match self {
            Part::DynamicAttr(d) => d.path.len(),
            Part::EventHandler(e) => e.path.len(),
            Part::Expression(e) => e.path.len(),
            Part::ComponentPart(c) => c.path.len(),
            Part::ForComponentPart(c) => c.path.len(),
        }
    }

    pub fn path(&self) -> &PathInstruction {
        match self {
            Part::DynamicAttr(d) => &d.path,
            Part::EventHandler(e) => &e.path,
            Part::Expression(e) => &e.path,
            Part::ComponentPart(c) => &c.path,
            Part::ForComponentPart(c) => &c.path,
        }
    }
}
