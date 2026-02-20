import {
  type BaseComponentElement,
  defineComponentElement,
  type Renderer,
} from "../runtime";
import type { ComponentLifecycle } from "./lifecycle";

export type Factory<T> = (l: ComponentLifecycle, props: T) => any;
export class ComponentMetadata<T = any> {
  constructor(
    private _constructor: any,
    public tagName: string,
    public registrationName: string,
    public isBuiltIn: boolean,
    public props: T = {} as T,
  ) {}

  createElement(props: T = {} as T, key?: string) {
    let ele: BaseComponentElement;

    if (this.isBuiltIn) {
      ele = document.createElement(this.tagName, {
        is: this.registrationName,
      }) as any;
    } else {
      ele = document.createElement(this.tagName) as any;
    }

    (ele as any).__props = props;
    ele.__key = key;

    return ele;
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
    m.registrationName,
    m.isBuiltIn,
    {},
  ) as any;
}
