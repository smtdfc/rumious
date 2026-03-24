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
mod deps_extractor;
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
          import { createApp } from '@rumious/core';

const app = createApp(document.getElementById('root')!);
function Hello() {
  return <h1>Hello</h1>;
}
app.attach(<Hello/>);


        ";

        let options = CompileOption {
            file_name: "hello.ts".to_string(),
        };

        let result = compile(&code, Some(options)).expect("Error");

        println!("Code: {}", result.code);
        println!("Map: {}", result.map);
    }

    #[test]
    fn forwards_component_props_and_keeps_sourcemap() {
        let code = "
          import { createApp } from '@rumious/core';

const app = createApp(document.getElementById('root')!);
function Hello(ins, props) {
  return <h1>{props.title}</h1>;
}
const n = 3;
const rest = { extra: true };
app.attach(<Hello title=\"Hi\" count={n} {...rest} disabled />);
        ";

        let options = CompileOption {
            file_name: "hello-props.ts".to_string(),
        };

        let result = compile(&code, Some(options)).expect("Error");

        assert!(result.code.contains("Hello, {"));
        assert!(result.code.contains("\"title\": \"Hi\""));
        assert!(result.code.contains("\"count\": n"));
        assert!(result.code.contains("...rest"));
        assert!(result.code.contains("\"disabled\": true"));

        assert!(result.map.contains("\"sources\":[\"hello-props.ts\"]"));
    }
}
