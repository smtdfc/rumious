import { ComponentConstructor, Component } from './component.js';
import { RenderContext } from '../render/index.js';
import type { RenderContent } from '../types/index.js';

export class ComponentElement<T extends object> extends HTMLElement {
  public instance: Component<T> | null = null;

  setSlot(tmpl: RenderContent) {
    if (this.instance) this.instance.children = tmpl;
  }

  async connectedCallback() {
    if (!this.instance) return;
    this.instance.onMounted();
    await this.instance.requestRender();
  }

  async disconnectedCallback() {
    if (!this.instance) return;
    this.instance.onDestroy();
  }
}

export function createComponentElement<T extends object>(
  component: ComponentConstructor<T>,
  context: RenderContext,
  props: T,
) {
  const tagName = component.tagName ?? 'rumious-component';
  if (!window.customElements.get(tagName)) {
    window.customElements.define(tagName, ComponentElement);
  }

  const element = document.createElement(tagName) as ComponentElement<T>;
  const instance = new component(props, element, context);
  element.instance = instance;
  instance.element = element;
  instance.beforeMount();
  return element;
}
