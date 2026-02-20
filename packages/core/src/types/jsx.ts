import type { ComponentMetadata } from "../component";

type NativeElements = {
  [K in keyof HTMLElementTagNameMap]: CustomAttributes & {
    [P in keyof HTMLElementTagNameMap[K] as HTMLElementTagNameMap[K][P] extends Function
      ? never
      : P]?: any;
  } & {
    [key: `on:${string}`]: ((ev: any) => void) | undefined;
  };
};

interface CustomAttributes {
  id?: string;
  class?: string;
  style?: string | Partial<CSSStyleDeclaration>;
  children?: any;

  [key: string]: any;
}
declare global {
  namespace JSX {
    interface Element extends ComponentMetadata {}

    interface ElementClass extends ComponentMetadata {
      props: any;
    }

    interface ElementAttributesProperty {
      props: {};
    }

    interface IntrinsicAttributes {
      [name: string]: any;
    }

    interface IntrinsicElements extends NativeElements {
      [tagName: string]: any;
    }
  }
}

export {};
