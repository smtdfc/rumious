import type { ComponentMetadata } from "../component";

declare global {
  namespace JSX {
    interface Element extends ComponentMetadata {}

    interface ElementClass extends ComponentMetadata {
      props: any;
    }

    interface ElementAttributesProperty {
      props: {};
    }

    interface IntrinsicElements {
      [tagName: string]: any;
    }
  }
}
export {};
