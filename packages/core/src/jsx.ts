import type { Renderer } from "./runtime/renderer.js";

type PrimitiveChild = string | number | boolean | null | undefined;
type RumiousChild = PrimitiveChild | Node | Renderer | RumiousChild[];
type RumiousEventHandler<E extends Event = Event> = (event: E) => unknown;

type RumiousHTMLAttributes<T extends HTMLElement = HTMLElement> = {
  id?: string;
  class?: string;
  className?: string;
  style?: string;
  title?: string;
  children?: RumiousChild;
  ref?: (element: T) => void;
} & {
  [K in `on${string}`]?: RumiousEventHandler | undefined;
} & {
  [attrName: string]: unknown;
};

declare global {
  namespace JSX {
    type Element = Renderer;

    interface ElementChildrenAttribute {
      children: {};
    }

    interface IntrinsicAttributes {
      key?: string | number;
    }

    type LibraryManagedAttributes<C, P> = P;

    type IntrinsicElements = {
      [K in keyof HTMLElementTagNameMap]: RumiousHTMLAttributes<
        HTMLElementTagNameMap[K]
      >;
    } & {
      [elementName: string]: RumiousHTMLAttributes;
    };
  }
}

export {};
