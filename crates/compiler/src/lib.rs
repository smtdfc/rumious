use wasm_bindgen::prelude::wasm_bindgen;

use crate::{
    compiler::{CompileOption, Compiler},
    result::CompileResult,
};

#[wasm_bindgen(start)]
pub fn init_panic_hook() {
    console_error_panic_hook::set_once();
}

#[wasm_bindgen]
pub fn compile(code: &str, options: Option<CompileOption>) -> Result<CompileResult, String> {
    let globals = swc_common::Globals::new();
    swc_common::GLOBALS.set(&globals, || {
        let mut compiler = Compiler::new();
        compiler.compile(code, options)
    })
}

mod compiler;
mod context;
mod helpers;
mod parts;
mod result;
mod sourcemap;
mod transformer;
mod utils;
mod visitor;

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn check() {
        let code = "
            const a = 100;
            const b = <h1>hello</h1>
            const c = <h2>snsn</h2>

        ";

        let options = CompileOption {
            file_name: "hello.ts".to_string(),
        };

        let result = compile(&code, Some(options)).expect("Error");

        println!("Code: {}", result.code);
        println!("Map: {}", result.map);
    }
}
