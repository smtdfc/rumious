import {
  ComponentLifecycle,
  ComponentMetadata,
  type Factory,
} from "../component";
import { State, type EffectFunction } from "../state";
import { getBaseClass } from "../utils";

const EVENT_SYMBOL = Symbol("__events");
const delegatedEvents = new Set<string>();

export class Context {
  remembered: Map<any, any>;
  ranges: Map<
    string,
    {
      start: Comment;
      end: Comment;
    }
  >;

  constructor(public target: ComponentLifecycle) {
    this.remembered = new Map();
    this.ranges = new Map();
  }

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

export interface BaseComponent {
  __props: any;
  __key?: string;
  _initialized: boolean;
  lifecycle: ComponentLifecycle | null;
  ctx: Context | null;
}

export type BaseComponentElement = HTMLElement & BaseComponent;

export function defineComponentElement(factory: Factory<any>, tagName: string) {
  const isBuiltIn = !tagName.includes("-");

  const BaseClass = getBaseClass(tagName);

  class ComponentElement extends BaseClass implements BaseComponent {
    public _initialized = false;
    public lifecycle: ComponentLifecycle | null = null;
    public ctx: Context | null = null;
    public __props: any = {};
    public __key?: string;
    __pendingCleanup: number = 0;

    constructor() {
      super();
    }

    connectedCallback() {
      if (this.__pendingCleanup) {
        cancelAnimationFrame(this.__pendingCleanup);
        this.__pendingCleanup = -1;
      }

      if (!this._initialized) {
        this.lifecycle = new ComponentLifecycle();
        this.ctx = new Context(this.lifecycle);

        (this.lifecycle as any).self = this;

        const renderer = factory(this.lifecycle, this.__props);
        const fragment = renderer.render(this.ctx);

        this.appendChild(fragment);
        this._initialized = true;
      }

      const effects = this.lifecycle?.effects;
      if (effects) {
        for (let i = 0; i < effects.length; i++) {
          effects[i]!.run();
        }
      }
    }

    disconnectedCallback() {
      this.__pendingCleanup = requestAnimationFrame(() => {
        this.lifecycle?.destroy();
        this.lifecycle = null;
        this.ctx = null;
        this._initialized = false;
        this.innerHTML = "";
      });
    }
  }

  if (!window.customElements.get(isBuiltIn ? `rumious-${tagName}` : tagName)) {
    if (isBuiltIn) {
      window.customElements.define(
        `rumious-${tagName}`,
        ComponentElement as any,
        { extends: tagName },
      );
    } else {
      window.customElements.define(tagName, ComponentElement as any);
    }
  }

  return {
    ComponentElement,
    isBuiltIn,
    registrationName: isBuiltIn ? `rumious-${tagName}` : tagName,
  };
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
  const len = path.length;

  for (let i = 0; i < len; i++) {
    const charCode = path.charCodeAt(i);

    switch (charCode) {
      case 102: // 'f'
        current = current.firstChild;
        break;
      case 115: // 's'
        current = current.nextSibling;
        break;
      default:
        throw new Error(`Invalid path char: ${path[i]}`);
    }

    if (current === null) {
      throw new Error(`Invalid walk path "${path}" at step ${i}`);
    }
  }

  return current;
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
  //(node as any).remove();

  const range = { start, end };
  ctx.ranges.set(rememberKey, range);

  return range;
}

export function $$dynamic(
  range: { start: Comment; end: Comment },
  expr: any,
  ctx: Context,
): void {
  const { start, end } = range;
  const parent = start.parentNode!;

  let content: Node;

  if (expr instanceof Node) {
    // Element, DocumentFragment, Text...
    content = expr;
  } else if (expr && typeof expr === "object" && "render" in expr) {
    content = expr.render(ctx);
  } else {
    content = document.createTextNode(String(expr));
  }

  const firstChild = start.nextSibling;

  if (!firstChild || firstChild === end) {
    parent.insertBefore(content, end);
    return;
  }

  if (
    firstChild.nodeType === Node.TEXT_NODE &&
    content.nodeType === Node.TEXT_NODE &&
    firstChild.nextSibling === end
  ) {
    if (firstChild.textContent !== content.textContent) {
      firstChild.textContent = content.textContent;
    }
    return;
  }

  parent.replaceChild(content, firstChild);

  let next = content.nextSibling;
  while (next && next !== end) {
    const toRemove = next;
    next = next.nextSibling;
    parent.removeChild(toRemove);
  }
}

export function $$component(
  componentExpr: any,
  node: HTMLElement,
  props: Record<string, any>,
  ctx: Context,
) {
  let element = componentExpr.createElement(props);
  node.replaceWith(element);
  return element;
}

export function $$for(
  range: { start: Comment; end: Comment },
  ctx: Context,
  template: ComponentMetadata,
  data: any,
  other: any,
  keyFn: (index: number, d: any) => string,
) {
  const parent = range.start.parentNode;
  const cache = new Map<string, BaseComponentElement>();
  let currentNodes: BaseComponentElement[] = [];

  function render() {
    const values = data instanceof State ? data.get() : data;
    const nextNodes: BaseComponentElement[] = [];
    const seenKeys = new Set<string>();

    for (let index = 0; index < values.length; index++) {
      const val = values[index];
      const key = keyFn(index, val);
      let el = cache.get(key);

      if (!el) {
        el = template.createElement({ data: val, other }, key);
        cache.set(key, el);
      } else {
        el.__props.data = val;
      }
      nextNodes.push(el);
      seenKeys.add(key);
    }

    if (currentNodes.length === 0 && nextNodes.length > 0) {
      const fragment = document.createDocumentFragment();
      nextNodes.forEach((node) => fragment.appendChild(node as any));
      parent?.insertBefore(fragment, range.end);
    } else {
      reconcileArrays(parent, currentNodes, nextNodes, range.end);
    }

    for (const key of cache.keys()) {
      if (!seenKeys.has(key)) {
        cache.delete(key);
      }
    }

    currentNodes = nextNodes;
  }

  render();

  if (data instanceof State) {
    ctx.addEffect(render, [data]);
  }
}

const SUFFIX_CAP = "_cap";
const SUFFIX_BUB = "_bub";

export function $$event(
  node: any,
  name: string,
  expr: any,
  isCapture: boolean = false,
) {
  const events = node[EVENT_SYMBOL] || (node[EVENT_SYMBOL] = {});
  events[name + (isCapture ? SUFFIX_CAP : SUFFIX_BUB)] = expr;

  if (!delegatedEvents.has(name)) {
    delegatedEvents.add(name);
    setupDelegation(name);
  }
}

function setupDelegation(eventName: string) {
  createListener(eventName, true);
  createListener(eventName, false);
}

function createListener(eventName: string, isCapturePhase: boolean) {
  const suffix = isCapturePhase ? SUFFIX_CAP : SUFFIX_BUB;

  document.addEventListener(
    eventName,
    (event) => {
      let target = event.target as any;
      if (!target) return;
      while (target !== null && target !== document) {
        const handler = target[EVENT_SYMBOL]?.[eventName + suffix];

        if (handler !== undefined) {
          handler.call(target, event);

          if (event.cancelBubble) break;
        }
        target = target.parentNode;
      }
    },
    isCapturePhase,
  );
}

// This reconciliation algorithm is a modified version of udomdiff.
// Inspired by Ryan Carniato's work on fine-grained reactivity.
// Original concept by @WebReflection (Andrea Giammarchi).
function reconcileArrays(parentNode: any, a: any, b: any, anchor: any) {
  let bLength = b.length,
    aEnd = a.length,
    bEnd = bLength,
    aStart = 0,
    bStart = 0,
    after = anchor || (aEnd > 0 ? a[aEnd - 1].nextSibling : null),
    map = null as any;

  while (aStart < aEnd || bStart < bEnd) {
    // common prefix
    if (a[aStart] === b[bStart]) {
      aStart++;
      bStart++;
      continue;
    } // common suffix
    while (a[aEnd - 1] === b[bEnd - 1]) {
      aEnd--;
      bEnd--;
    } // append
    if (aEnd === aStart) {
      const node =
        bEnd < bLength
          ? bStart
            ? b[bStart - 1].nextSibling
            : b[bEnd - bStart]
          : after;

      while (bStart < bEnd) parentNode.insertBefore(b[bStart++], node); // remove
    } else if (bEnd === bStart) {
      while (aStart < aEnd) {
        if (!map || !map.has(a[aStart])) a[aStart].remove();
        aStart++;
      } // swap backward
    } else if (a[aStart] === b[bEnd - 1] && b[bStart] === a[aEnd - 1]) {
      const node = a[--aEnd].nextSibling;
      parentNode.insertBefore(b[bStart++], a[aStart++].nextSibling);
      parentNode.insertBefore(b[--bEnd], node);

      a[aEnd] = b[bEnd]; // fallback to map
    } else {
      if (!map) {
        map = new Map();
        let i = bStart;

        while (i < bEnd) map.set(b[i], i++);
      }

      const index = map.get(a[aStart]);
      if (index != null) {
        if (bStart < index && index < bEnd) {
          let i = aStart,
            sequence = 1,
            t;

          while (++i < aEnd && i < bEnd) {
            if ((t = map.get(a[i])) == null || t !== index + sequence) break;
            sequence++;
          }

          if (sequence > index - bStart) {
            const node = a[aStart];
            while (bStart < index) parentNode.insertBefore(b[bStart++], node);
          } else {
            parentNode.insertBefore(b[bStart++], a[aStart]);
          }
        } else aStart++;
      } else a[aStart++].remove();
    }
  }
}
