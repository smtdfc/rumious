import { RumiousJSXFactory } from "./types/jsx.js";
import type { RumiousContext } from "./context/context.js";
import type { RumiousRenderTemplate } from "./render/template.js";



declare global {
  interface Window {
    RUMIOUS_JSX: RumiousJSXFactory;
    RUMIOUS_CONTEXTS: Record<string,RumiousContext<any>>;
  }
  
  namespace JSX {
    interface ElementClass {
      template: () => RumiousRenderTemplate;
    }
    
    interface ElementAttributesProperty {
      props: {};
    }
    
    type Element = RumiousRenderTemplate;
    
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

export * from "./component/index.js";
export * from "./app/index.js";
export * from "./jsx/index.js";
export * from "./render/index.js";
export * from "./ref/index.js";
export * from "./state/index.js";
export * from "./context/index.js";
export * from "./performance/index.js"