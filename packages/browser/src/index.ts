import {
  EVENT_DELEGATE_SYMBOL,
  EVENT_DELEGATION,
  RenderContext,
  RenderContent,
  ComponentConstructor,
  State,
  ViewControl,
  Ref,
  ForProps,
  IfProps,
  StateCommit,
  createComponentElement,
  isRenderContent,
} from '@rumious/core';

function createMarkedFragment() {
  const start = document.createComment('r:start');
  const end = document.createComment('r:end');
  const fragment = document.createDocumentFragment();
  fragment.append(start, end);
  
  return {
    fragment,
    
    insertAt(el: Node, index: number) {
      let ref = start.nextSibling;
      let i = 0;
      while (ref && ref !== end) {
        if (i === index) break;
        i++;
        ref = ref.nextSibling;
      }
      end.parentNode!.insertBefore(el, ref ?? end);
    },
    
    insertRange(els: Node[], index: number) {
      let node = start.nextSibling;
      let i = 0;
      while (node && node !== end) {
        if (i === index) break;
        if (node.nodeType === 1) i++;
        node = node.nextSibling;
      }
      const ref = node ?? end;
      const frag = document.createDocumentFragment();
      for (let el of els) frag.appendChild(el);
      ref.parentNode!.insertBefore(frag, ref);
    },
    
    replace(...nodes: Node[]) {
      const parent = start.parentNode!;
      let node = start.nextSibling;
      while (node && node !== end) {
        const next = node.nextSibling;
        parent.removeChild(node);
        node = next;
      }
      
      if (nodes.length === 0) return;
      const frag = document.createDocumentFragment();
      for (let n of nodes) frag.appendChild(n);
      parent.insertBefore(frag, end);
    },
  };
}

export function eventDelegate(events: string[]) {
  for (const name of events) {
    if (!EVENT_DELEGATION.includes(name)) {
      EVENT_DELEGATION.push(name);
      window.addEventListener(name, (event: Event) => {
        const target = event.target as HTMLElement & {
          [EVENT_DELEGATE_SYMBOL] ? : Record < string,
          (e: Event) => unknown > ;
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
  attrs ? : Record < string, string > ,
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
    [EVENT_DELEGATE_SYMBOL] ? : Record < string,
    (e: Event) => unknown > ;
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

export function createComponent < T extends object > (
  parent: HTMLElement,
  context: RenderContext,
  component: ComponentConstructor < T > ,
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

export function view(
  context: RenderContext,
  element: HTMLElement,
  value: unknown,
) {
  if (value instanceof ViewControl) value.setTarget(element);
}


export function createIfComponent < T > (
  parent: HTMLElement,
  context: RenderContext,
  props: IfProps < T > ,
) {
  let onTrue = props.onTrue;
  let onFalse = props.onFalse;
  const render = () => {
    let condition = props.condition instanceof State ? props.condition.get() : props.condition;
    let templ: DocumentFragment = document.createDocumentFragment();
    
    if (condition && onTrue) {
      templ = onTrue(context);
    } else if (onFalse && !condition) {
      templ = onFalse(context);
    }
    
    marker.replace(...templ.childNodes);
  }
  
  const marker = createMarkedFragment();
  render();
  if (props.condition instanceof State) {
    const state = props.condition; 
    context.onRenderFinish.push(() => {
      state.reactor.addInternalBinding((commit: StateCommit<unknown>) => render());
    });
  }
  
  parent.appendChild(marker.fragment);
}

export function createForComponent < T > (
  parent: HTMLElement,
  context: RenderContext,
  props: ForProps < T > ,
) {
  const tmpl = props.template;
  const marker = createMarkedFragment();
  const items: HTMLElement[] = [];
  
  // Initial render
  const initialList = props.list.get();
  for (let i = 0; i < initialList.length; i++) {
    const el = tmpl(initialList[i])(context).children[0] as HTMLElement;
    items.push(el);
  }
  
  parent.appendChild(marker.fragment);
  marker.insertRange(items, 0);
  context.onRenderFinish.push(() => {
    props.list.reactor.addInternalBinding(({ type, key, value }) => {
      switch (type) {
        case 'insert': {
          const el = tmpl(value as T)(context).children[0] as HTMLElement;
          items.splice(key as number, 0, el);
          marker.insertAt(el, key as number);
          break;
        }
        
        case 'remove': {
          const removed = items.splice(key as number, 1)[0];
          removed?.remove?.();
          break;
        }
        
        case 'update': {
          const newEl = tmpl(value as T)(context).children[0] as HTMLElement;
          const oldEl = items[key as number];
          if (oldEl !== newEl) {
            items[key as number] = newEl;
            oldEl.replaceWith(newEl);
          }
          break;
        }
        
        case 'set': {
          for (const item of items) item.remove?.();
          items.length = 0;
          
          const fresh = (value as T[]).map((val) => {
            const el = tmpl(val)(context).children[0] as HTMLElement;
            items.push(el);
            return el;
          });
          
          marker.insertRange(fresh, 0);
          break;
        }
      }
    });
  });
}