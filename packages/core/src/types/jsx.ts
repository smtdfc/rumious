import type { Component } from '../component/index.js';
import type { RenderContent } from './render.js';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }

    type Element = RenderContent;

    interface ElementClass extends Component<any> {
      template(): RenderContent;
    }

    interface ElementAttributesProperty {
      props: {};
    }

    interface ElementChildrenAttribute {
      children: {};
    }
  }
}

export {};
