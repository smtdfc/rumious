import { ComponentLifecycle, type Factory } from "../component";
import type { EffectFunction } from "../state";

export class Context {
  remembered: Map<any, any> = new Map();
  ranges: Map<
    string,
    {
      start: Comment;
      end: Comment;
    }
  > = new Map();

  constructor(public target: ComponentLifecycle) {}

  addEffect(cb: EffectFunction, deps: any[] = []) {
    this.target.effect(cb, deps);
  }
}

export class Renderer {
  constructor(public fn: (ctx: Context) => DocumentFragment) {}
  render(ctx: Context) {
    return this.fn(ctx);
  }
}

export class BaseComponentElement extends HTMLElement {
  __props: any = {};
  public _initialized = false;
  public lifecycle = new ComponentLifecycle();
  public ctx = new Context(this.lifecycle);

  constructor() {
    super();
  }
}

export function defineComponentElement(factory: Factory<any>, tagName: string) {
  class ComponentElement extends BaseComponentElement {
    constructor() {
      super();
    }

    connectedCallback() {
      if (!this._initialized) {
        const renderer = factory(this.lifecycle, this.__props);
        const fragment = renderer.render(this.ctx);
        this.appendChild(fragment);
        this._initialized = true;
      }

      const effects = this.lifecycle.effects;
      const len = effects.length;

      for (let i = 0; i < len; i++) {
        effects[i]!.run();
      }
    }

    disconnectedCallback() {
      this.lifecycle.destroy();
      this._initialized = false;
      this.innerHTML = "";
    }
  }

  if (!window.customElements.get(tagName)) {
    window.customElements.define(tagName, ComponentElement);
  }

  return { ComponentElement };
}

export function $$createRenderer(fn: (ctx: Context) => DocumentFragment) {
  return new Renderer(fn);
}

export function $$element(tag: string, parent: HTMLElement) {
  let ele = document.createElement(tag);
  parent.appendChild(ele);
  return ele;
}

export function $$template(html: string) {
  let temp = document.createElement("template");
  temp.innerHTML = html;

  return temp;
}

export function $$clone(template: HTMLTemplateElement) {
  return template.content.cloneNode(true);
}

export function $$attach(
  parent: HTMLElement,
  ctx: Context,
  renderer: Renderer,
) {
  const frag = renderer.render(ctx);
  parent.appendChild(frag);

  return ctx;
}

export function $$walk(root: Node, path: string): HTMLElement {
  let current: any = root;

  for (let i = 0; i < path.length; i++) {
    const step = path[i];
    if (step === "f") {
      current = current.firstChild;
    } else if (step === "s") {
      current = current.nextSibling;
    }

    if (!current) {
      throw new Error(`Error: Invalid walk path "${path}" at step ${i}`);
    }
  }

  return current as HTMLElement;
}

export function $$range(
  node: Node,
  rememberKey: string,
  ctx: Context,
): { start: Comment; end: Comment } {
  if (ctx.ranges.has(rememberKey)) {
    return ctx.ranges.get(rememberKey)!;
  }

  const start = document.createComment(`range-start:${rememberKey}`);
  const end = document.createComment(`range-end:${rememberKey}`);

  node.parentNode!.insertBefore(start, node);
  node.parentNode!.insertBefore(end, node.nextSibling);

  const range = { start, end };
  ctx.ranges.set(rememberKey, range);

  return range;
}
export function $$text(
  range: { start: Comment; end: Comment },
  expr: any,
  ctx: Context,
): void {
  const { start, end } = range;
  const parent = start.parentNode!;
  const value = String(expr);

  let firstChild = start.nextSibling;

  if (!firstChild || firstChild === end) {
    const textNode = document.createTextNode(value);
    parent.insertBefore(textNode, end);
    return;
  }

  if (firstChild.nodeType === Node.TEXT_NODE) {
    if (firstChild.textContent !== value) {
      firstChild.textContent = value;
    }
  } else {
    const textNode = document.createTextNode(value);
    parent.replaceChild(textNode, firstChild);
  }

  let next = firstChild.nextSibling;
  while (next && next !== end) {
    const toRemove = next;
    next = next.nextSibling;
    parent.removeChild(toRemove);
  }
}
