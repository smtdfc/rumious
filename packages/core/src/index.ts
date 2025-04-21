import { RumiousJSXFactory } from './types/jsx.js';
import type { RumiousContext } from './context/context.js';
import type { RumiousRenderTemplate } from './render/template.js';

declare global {
  interface Window {
    RUMIOUS_JSX: RumiousJSXFactory;
    RUMIOUS_CONTEXTS: Record < string,
    RumiousContext < any >> ;
  }
  
  declare namespace JSX {
    type Element = RumiousRenderTemplate;
    
    interface ElementClass {
      template: () => RumiousRenderTemplate;
    }
    
    interface ElementAttributesProperty {
      props: {};
    }
    
    interface IntrinsicElements {
      [elemName: string]: any;
    }
    
    type Fragment = 'RUMIOUS_INTERNAL_FRAGMENT';
  }
}

export * from './component/index.js';
export * from './app/index.js';
export * from './jsx/index.js';
export * from './render/index.js';
export * from './ref/index.js';
export * from './state/index.js';
export * from './context/index.js';
export * from './performance/index.js';