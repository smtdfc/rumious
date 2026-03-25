use std::vec;
use swc_ecma_ast::Ident;

use crate::helpers::ASTHelper;
use crate::parts::Part;

#[repr(u8)]
#[derive(Clone, Debug, Copy, PartialEq, Eq, Hash, PartialOrd, Ord)]
pub enum PathInstructionKind {
    First = 1,
    Sibling = 2,
}

#[derive(Clone, Eq, Hash, PartialEq)]
pub struct PathInstruction {
    path: Vec<PathInstructionKind>,
}

pub type Path = Vec<PathInstructionKind>;
impl PathInstruction {
    pub fn new() -> Self {
        Self { path: vec![] }
    }

    pub fn len(&self) -> usize {
        self.path.len()
    }

    pub fn mark(&mut self, kind: PathInstructionKind) {
        self.path.push(kind);
    }

    pub fn truncate(&mut self, length: usize) {
        self.path.truncate(length);
    }

    pub fn to_string(&self) -> String {
        let mut path = String::from("");
        for p in &self.path {
            match p {
                PathInstructionKind::First => path.push('f'),
                PathInstructionKind::Sibling => path.push('s'),
            }
        }
        path
    }
}

pub struct Counter {
    pub counter: i128,
}

impl Counter {
    pub fn new() -> Self {
        Self { counter: 0 }
    }

    fn to_base36(mut value: u128) -> String {
        const ALPHABET: &[u8; 36] = b"0123456789abcdefghijklmnopqrstuvwxyz";

        if value == 0 {
            return "0".to_string();
        }

        let mut chars: Vec<char> = Vec::new();
        while value > 0 {
            let digit = (value % 36) as usize;
            chars.push(ALPHABET[digit] as char);
            value /= 36;
        }

        chars.iter().rev().collect()
    }

    pub fn increase(&mut self) -> String {
        self.counter += 1;

        Self::to_base36(self.counter as u128)
    }
}

pub struct Context {
    pub html: String,
    pub root_var: Ident,
    pub frag_var: Ident,
    pub template_var: Ident,
    pub extra_templates: Vec<(Ident, String)>,
    pub ctx_var: Ident,
    pub parts: Vec<Part>,
    pub node_path_instructions: PathInstruction,
    pub counter: Counter,
}

impl Context {
    pub fn new(counter: &mut Counter) -> Self {
        let root_var = ASTHelper::generate_ident("$$_root".to_string(), counter);
        let template_var = ASTHelper::generate_ident("$$_template".to_string(), counter);
        let ctx_var = ASTHelper::generate_ident("$$_ctx".to_string(), counter);
        let frag_var = ASTHelper::generate_ident("$$_frag".to_string(), counter);

        Self {
            html: String::from(""),
            root_var: root_var,
            template_var: template_var,
            extra_templates: vec![],
            ctx_var: ctx_var,
            frag_var: frag_var,
            parts: vec![],
            node_path_instructions: PathInstruction::new(),
            counter: Counter::new(),
        }
    }
}
