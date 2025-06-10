import type * as JSXUtils from './jsx/index.js';
import type { RumiousTemplate } from './types/index.js';

export {}; 

declare global {
  var RUMIOUS: typeof JSXUtils;
  
  namespace JSX {
    type Element = RumiousTemplate;
    
    interface IntrinsicElements {
      [tagName: string]: any;
    }
    
    interface ElementChildrenAttribute {
      children: {};
    }
  }
}