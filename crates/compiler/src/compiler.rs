use std::sync::{Arc, Mutex};

use swc_common::errors::Handler;
use swc_common::sync::Lrc;
use swc_common::{FileName, SourceMap};
use swc_core::ecma::codegen::text_writer::JsWriter;
use swc_core::ecma::codegen::{Config, Emitter};
use swc_core::ecma::visit::VisitMutWith;
use swc_ecma_parser::TsSyntax;
use swc_ecma_parser::{Parser, StringInput, Syntax, lexer::Lexer};
use wasm_bindgen::prelude::wasm_bindgen;

use crate::result::CompileResult;
use crate::sourcemap::SourceMapConfig;
use crate::visitor::Visitor;

#[wasm_bindgen]
pub struct CompileOption {
    #[wasm_bindgen(getter_with_clone)]
    pub file_name: String,
}

#[wasm_bindgen]
impl CompileOption {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        Self {
            file_name: "".to_string(),
        }
    }
}
pub struct Compiler {}

impl Compiler {
    pub fn new() -> Self {
        Self {}
    }

    pub fn compile(
        &mut self,
        code: &str,
        options: Option<CompileOption>,
    ) -> Result<CompileResult, String> {
        let cm: Lrc<SourceMap> = Default::default();
        let options = options.expect("Error");
        let fm = cm.new_source_file(FileName::Custom(options.file_name).into(), code.to_string());

        let lexer = Lexer::new(
            Syntax::Typescript(TsSyntax {
                tsx: true,
                decorators: true,
                dts: false,
                no_early_errors: false,
                disallow_ambiguous_jsx_like: true,
            }),
            Default::default(),
            StringInput::from(&*fm),
            None,
        );

        let mut parser = Parser::new_from(lexer);

        let buffer = Arc::new(Mutex::new(Vec::new()));
        let writer = Box::new(WriteAndCapture {
            buffer: buffer.clone(),
        });

        let handler = Handler::with_emitter_writer(writer, Some(cm.clone()));

        let mut module = parser.parse_module().map_err(|e| {
            e.into_diagnostic(&handler).emit();

            let err_msg = String::from_utf8_lossy(&buffer.lock().unwrap()).to_string();
            err_msg
        })?;

        let mut visitor = Visitor::new();
        module.visit_mut_with(&mut visitor);

        let mut code_buf = Vec::new();
        let mut srcmap_buf = Vec::new();
        {
            let writer = JsWriter::new(cm.clone(), "\n", &mut code_buf, Some(&mut srcmap_buf));
            let mut emitter = Emitter {
                cfg: Config::default(),
                cm: cm.clone(),
                comments: None,
                wr: writer,
            };
            emitter
                .emit_module(&module)
                .map_err(|e| format!("Error: {:?}", e))?;
        }

        let built_map = cm.build_source_map(&srcmap_buf, None, SourceMapConfig);
        let output_code = String::from_utf8(code_buf).map_err(|e| format!("Error: {:?}", e))?;
        let mut map_buf = Vec::new();
        built_map.to_writer(&mut map_buf).unwrap();

        Ok(CompileResult {
            code: output_code,
            map: String::from_utf8(map_buf).unwrap(),
        })
    }
}

struct WriteAndCapture {
    buffer: Arc<Mutex<Vec<u8>>>,
}
impl std::io::Write for WriteAndCapture {
    fn write(&mut self, buf: &[u8]) -> std::io::Result<usize> {
        self.buffer.lock().unwrap().extend_from_slice(buf);
        Ok(buf.len())
    }
    fn flush(&mut self) -> std::io::Result<()> {
        Ok(())
    }
}
