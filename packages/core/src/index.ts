import type { ComponentMetadata } from "./component";

export class App {
  attach(root: HTMLElement, component: ComponentMetadata<any>) {
    let element = component.createElement();
    root.appendChild(element);
  }
}

export * from "./state";
export * from "./component";
export * from "./runtime";
