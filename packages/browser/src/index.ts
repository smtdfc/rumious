import {
  EVENT_DELEGATE_SYMBOL,
  EVENT_DELEGATION,
  RenderContext,
  ComponentConstructor,
  State,
  Ref,
  createComponentElement,
  isRenderContent,
} from '@rumious/core';

/*
function createMarkedFragment(startText = 'marker:start', endText = 'marker:end') {
  const fragment = document.createDocumentFragment();
  
  const start = document.createComment(startText);
  const end = document.createComment(endText);
  fragment.appendChild(start);
  fragment.appendChild(end);
  
  return {
    fragment,
    start,
    end,
    replace(...newNodes: Node[]) {
      // Remove all nodes between start and end
      let node = start.nextSibling;
      while (node && node !== end) {
        const next = node.nextSibling;
        node.parentNode?.removeChild(node);
        node = next;
      }
      // Insert new content
      newNodes.forEach(n => end.parentNode?.insertBefore(n, end));
    }
  };
}

*/

export function eventDelegate(events: string[]) {
  for (const name of events) {
    if (!EVENT_DELEGATION.includes(name)) {
      EVENT_DELEGATION.push(name);
      window.addEventListener(name, (event: Event) => {
        const target = event.target as HTMLElement & {
          [EVENT_DELEGATE_SYMBOL]?: Record<string, (e: Event) => unknown>;
        };

        if (
          target &&
          target[EVENT_DELEGATE_SYMBOL] &&
          target[EVENT_DELEGATE_SYMBOL][name]
        ) {
          target[EVENT_DELEGATE_SYMBOL][name](event);
        }
      });
    }
  }
}

export function element(
  parent: HTMLElement,
  context: RenderContext,
  tagName: string,
  attrs?: Record<string, string>,
): HTMLElement {
  const el = document.createElement(tagName);

  if (attrs) {
    for (const key in attrs) {
      el.setAttribute(key, attrs[key]);
    }
  }

  parent.appendChild(el);
  return el;
}

export function appendText(parent: HTMLElement, content: string): Text {
  const textNode = document.createTextNode(content);
  parent.appendChild(textNode);
  return textNode;
}

export function createEvent(
  context: RenderContext,
  target: HTMLElement,
  name: string,
  callback: (e: Event) => unknown,
) {
  target = target as HTMLElement & {
    [EVENT_DELEGATE_SYMBOL]?: Record<string, (e: Event) => unknown>;
  };

  if (!target[EVENT_DELEGATE_SYMBOL]) target[EVENT_DELEGATE_SYMBOL] = {};
  target[EVENT_DELEGATE_SYMBOL][name] = callback;
}

export function reactive(
  context: RenderContext,
  callback: (value: unknown) => unknown,
  target: unknown,
) {
  if (target instanceof State) {
    context.onRenderFinish.push(() => {
      target.reactor.addInternalBinding(() => callback(target.get()));
    });
    callback(target.get());
  } else {
    callback(target);
  }
}

export function appendDynamicValue(
  context: RenderContext,
  parent: HTMLElement,
  value: unknown,
) {
  const start = document.createComment('_');
  const end = document.createComment('_');
  parent.appendChild(start);
  parent.appendChild(end);

  let prev: unknown = null;
  let currentNodes: Node[] = [];

  const replaceRange = (nodes: Node[]) => {
    // Remove all nodes between start and end
    let n = start.nextSibling;
    while (n && n !== end) {
      const next = n.nextSibling;
      parent.removeChild(n);
      n = next;
    }

    // Insert new nodes
    for (const node of nodes) {
      parent.insertBefore(node, end);
    }

    currentNodes = nodes;
  };

  const normalize = (val: unknown): Node[] => {
    if (Array.isArray(val)) {
      const flat: Node[] = [];
      for (const v of val) flat.push(...normalize(v));
      return flat;
    }

    if (isRenderContent(val)) {
      return [val(context)];
    }

    if (val == null || typeof val === 'boolean') return [];

    if (typeof val === 'string' || typeof val === 'number') {
      if (
        currentNodes.length === 1 &&
        currentNodes[0].nodeType === Node.TEXT_NODE
      ) {
        // reuse text node
        (currentNodes[0] as Text).textContent = String(val);
        return currentNodes;
      } else {
        return [document.createTextNode(String(val))];
      }
    }

    if (val instanceof Node) return [val];

    // Fallback
    return [document.createTextNode(String(val))];
  };

  const update = (val: unknown) => {
    if (val === prev) return;
    prev = val;

    const normalized = normalize(val);
    if (normalized !== currentNodes) {
      replaceRange(normalized);
    }
  };

  if (value instanceof State) {
    context.onRenderFinish.push(() => {
      value.reactor.addInternalBinding(() => update(value.get()));
    });
    update(value.get());
  } else {
    update(value);
  }
}

export function createComponent<T extends object>(
  parent: HTMLElement,
  context: RenderContext,
  component: ComponentConstructor<T>,
  props: T,
): HTMLElement {
  const element = createComponentElement(component, context, props);

  parent.appendChild(element);
  return element;
}

export function ref(
  context: RenderContext,
  element: HTMLElement,
  target: unknown,
) {
  if (target instanceof Ref) target.element = element;
}
