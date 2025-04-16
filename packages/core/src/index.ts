import { RumiousRenderTemplate } from "./render/template.js";
import { RumiousComponent } from "./component/component.js";

interface RumiousJSXFactory {
  template(...args: any[]): RumiousRenderTemplate;
  createElement(...args: any[]): RumiousRenderTemplate;
  addDirective(...args: any[]): void;
  dynamicValue(...args: any[]): void;
  createComponent(...args: any[]): HTMLElement;
}


declare global {
  interface Window {
    RUMIOUS_JSX: RumiousJSXFactory;
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
