use wasm_bindgen::prelude::wasm_bindgen;

#[wasm_bindgen]
pub struct CompileResult {
    #[wasm_bindgen(getter_with_clone)]
    pub code: String,
    #[wasm_bindgen(getter_with_clone)]
    pub map: String,
}
