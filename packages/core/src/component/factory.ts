import {
  BaseComponentElement,
  defineComponentElement,
  type Renderer,
} from "../runtime";
import type { ComponentLifecycle } from "./lifecycle";

export type Factory<T> = (l: ComponentLifecycle, props: T) => any;
export class ComponentMetadata<T> {
  constructor(
    private _constructor: any,
    public tagName: string,
    public props: T = {} as T,
  ) {}

  createElement() {
    if (!this._constructor) {
      throw new Error("Component constructor is not defined");
    }

    let ele = document.createElement(this.tagName);
    return ele as BaseComponentElement;
  }
}

export function component<T>(
  factory: Factory<T>,
  tagName: string,
): ComponentMetadata<T> & (new (props: T) => ComponentMetadata<T>) {
  const m = defineComponentElement(factory, tagName);
  return new ComponentMetadata(
    m.ComponentElement,
    tagName,
    {} /* Trust me */,
  ) as any;
}
