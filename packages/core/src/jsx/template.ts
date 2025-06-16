import { RumiousRenderContext, renderFrag, RumiousViewControl } from '../render/index.js';
import { RumiousTemplate } from '../types/index.js';
import { RumiousRef } from '../ref/index.js';
import { RumiousState, RumiousListState } from '../state/index.js';
import { createEvent } from './element.js';

export function createTemplate(
  fn: (root: HTMLElement | DocumentFragment, context: RumiousRenderContext) => HTMLElement
): RumiousTemplate {
  return Object.assign(fn, {
    __isTemplate: true as
    const
  });
}


export function html(
  h: string
): Node {
  let template = document.createElement('template');
  template.innerHTML = h;
  return template.content.cloneNode(true)
}



export const directives = {
  ref(context: RumiousRenderContext, modifier: string, target: HTMLElement, value: RumiousRef) {
    if (value instanceof RumiousRef) {
      value.setTarget(target);
    } else {
      throw new Error("Cannot setup element reference for non-RumiousRef object !");
    }
  },
  
  model(
    context: RumiousRenderContext,
    modifier: string,
    element: HTMLElement,
    state: RumiousState < any >
  ) {
    const tag = element.tagName,
      type = (element as HTMLInputElement).type;
    
    if (tag === "TEXTAREA") {
      element.addEventListener("input", () => state.set((element as HTMLTextAreaElement).value));
    } else if (tag === "SELECT") {
      element.addEventListener("change", () => {
        const s = element as HTMLSelectElement;
        state.set(s.multiple ? Array.from(s.selectedOptions).map(o => o.value) : s.value);
      });
    } else if (tag === "INPUT") {
      if (type === "checkbox") {
        element.addEventListener("change", () => state.set((element as HTMLInputElement).checked));
      } else if (type === "radio") {
        element.addEventListener("change", () => {
          const i = element as HTMLInputElement;
          if (i.checked) state.set(i.value);
        });
      } else if (type === "file") {
        element.addEventListener("change", () => {
          const f = (element as HTMLInputElement).files;
          state.set(element.hasAttribute("multiple") ? f : f?.[0] ?? null);
        });
      } else {
        element.addEventListener("input", () => {
          const val = (element as HTMLInputElement).value;
          state.set(type === "number" ? (val === "" ? null : +val) : val);
        });
      }
    }
  },
  
  on(
    context: RumiousRenderContext,
    event: string,
    element: HTMLElement,
    callback: (e: Event) => void
  ) {
    createEvent(
      element,
      event,
      callback
    );
  },
  
  bind(
    context: RumiousRenderContext,
    modifier: string,
    element: HTMLElement,
    state: RumiousState < any >
  ) {
    let reactive: () => void = () => {};
    
    switch (modifier) {
      case 'text':
        reactive = () => { element.textContent = String(state.get()) };
        break;
        
      case 'html':
        reactive = () => { element.innerHTML = String(state.get()) };
        break;
        
      case 'style':
        reactive = () => {
          const styles = state.get();
          if (typeof styles === 'string') {
            element.setAttribute('style', styles);
          } else if (typeof styles === 'object') {
            Object.assign(element.style, styles);
          }
        };
        break;
        
      case 'class':
        reactive = () => {
          const cls = state.get();
          if (typeof cls === 'string') element.className = cls;
          else if (Array.isArray(cls)) element.className = cls.join(' ');
          else if (typeof cls === 'object') {
            element.className = Object.entries(cls)
              .filter(([_, active]) => active)
              .map(([name]) => name)
              .join(' ');
          }
        };
        break;
        
      case 'disabled':
        reactive = () => {
          if ('disabled' in element)(element as any).disabled = Boolean(state.get());
        };
        break;
        
      case 'checked':
        reactive = () => {
          if (element instanceof HTMLInputElement || element instanceof HTMLInputElement) {
            element.checked = Boolean(state.get());
          }
        };
        break;
        
      case 'value':
        reactive = () => {
          if ('value' in element)(element as any).value = String(state.get());
        };
        break;
        
      default:
        throw new Error(`Unknown bind directive modifier: ${modifier}`);
    }
    
    
    
    function onStateChange(commit: any) {
      if (!document.contains(element) && state.reactor) {
        state.reactor.removeInternalBinding(onStateChange);
        return;
      }
      reactive();
    }
    
    context.onRendered.push(() => {
      reactive();
      if (!state.reactor) return;
      state.reactor.addInternalBinding(onStateChange);
    });
  },
  
  attr(
    context: RumiousRenderContext,
    attrName: string,
    element: HTMLElement,
    state: RumiousState < any >
  ) {
    
    function onStateChange(commit ? : any) {
      if (!document.contains(element) && state.reactor) {
        state.reactor.removeInternalBinding(onStateChange);
        return;
      }
      element.setAttribute(attrName, String(state.get()));
    }
    
    context.onRendered.push(() => {
      onStateChange();
      if (!state.reactor) return;
      state.reactor.addInternalBinding(onStateChange);
    });
  },
  
  prop(
    context: RumiousRenderContext,
    name: string,
    element: HTMLElement,
    state: RumiousState < any >
  ) {
    
    function onStateChange(commit ? : any) {
      if (!document.contains(element) && state.reactor) {
        state.reactor.removeInternalBinding(onStateChange);
        return;
      }
      (element as any)[name] = state.get();
    }
    
    context.onRendered.push(() => {
      onStateChange();
      if (!state.reactor) return;
      state.reactor.addInternalBinding(onStateChange);
    });
  },
  
  html(
    context: RumiousRenderContext,
    modifier: string,
    element: HTMLElement,
    state: RumiousState < any >
  ) {
    
    function onStateChange(commit ? : any) {
      if (!document.contains(element) && state.reactor) {
        state.reactor.removeInternalBinding(onStateChange);
        return;
      }
      element.innerHTML = String(state.get());
    }
    
    context.onRendered.push(() => {
      onStateChange();
      if (!state.reactor) return;
      state.reactor.addInternalBinding(onStateChange);
    });
  },
  
  show(
    context: RumiousRenderContext,
    modifier: string,
    element: HTMLElement,
    state: RumiousState < any >
  ) {
    
    function onStateChange(commit ? : any) {
      if (!document.contains(element) && state.reactor) {
        state.reactor.removeInternalBinding(onStateChange);
        return;
      }
      element.style.display = Boolean(state.get()) ? 'block' : 'none';
    }
    
    context.onRendered.push(() => {
      onStateChange();
      if (!state.reactor) return;
      state.reactor.addInternalBinding(onStateChange);
    });
  },
  
  hide(
    context: RumiousRenderContext,
    modifier: string,
    element: HTMLElement,
    state: RumiousState < any >
  ) {
    
    function onStateChange(commit ? : any) {
      if (!document.contains(element) && state.reactor) {
        state.reactor.removeInternalBinding(onStateChange);
        return;
      }
      element.style.display = !Boolean(state.get()) ? 'block' : 'none';
    }
    
    context.onRendered.push(() => {
      onStateChange();
      if (!state.reactor) return;
      state.reactor.addInternalBinding(onStateChange);
    });
  },
  
  each < T > (
    context: RumiousRenderContext,
    modifier: string,
    element: HTMLElement,
    configs: EachDirectiveConfig < T >
  ) {
    
    context = new RumiousRenderContext(
      context.app,
      context.target
    );
    
    const keyToNode = new Map < string,
      Node > ();
    const nodeOrder: string[] = [];
    
    for (const item of configs.value.value) {
      const key = configs.key(item);
      const templ = renderFrag(configs.templ(item, key), context);
      const dom = templ.childNodes[0] as Node;
      keyToNode.set(key, dom);
      nodeOrder.push(key);
      element.appendChild(dom);
    }
    
    if (!configs.value.reactor) return;
    
    configs.value.reactor.addInternalBinding((commit) => {
      const value = commit.value;
      const key = configs.key(value);
      
      if (commit.type === 'remove') {
        const oldDom = keyToNode.get(key);
        if (oldDom) {
          element.removeChild(oldDom);
          keyToNode.delete(key);
          const index = nodeOrder.indexOf(key);
          if (index !== -1) nodeOrder.splice(index, 1);
        }
        return;
      }
      
      const templ = renderFrag(configs.templ(value, key), context);
      const dom = templ.childNodes[0] as Node;
      
      switch (commit.type) {
        case 'append':
          keyToNode.set(key, dom);
          nodeOrder.push(key);
          element.appendChild(dom);
          break;
          
        case 'prepend':
          keyToNode.set(key, dom);
          nodeOrder.unshift(key);
          element.prepend(dom);
          break;
          
        case 'update': {
          const oldDom = keyToNode.get(key);
          if (oldDom) {
            keyToNode.set(key, dom);
            element.replaceChild(dom, oldDom);
          }
          break;
        }
        
        case 'insert': {
          const index = commit.key!;
          const anchorKey = nodeOrder[index];
          const anchorNode = keyToNode.get(anchorKey) ?? null;
          keyToNode.set(key, dom);
          nodeOrder.splice(index, 0, key);
          element.insertBefore(dom, anchorNode);
          break;
        }
      }
    });
  },
  
  view(
    context: RumiousRenderContext,
    modifier: string,
    element: HTMLElement,
    configs: RumiousViewControl
  ) {
    configs.addTarget({
      element,
      context
    });
  }
}

interface EachDirectiveConfig < T > {
  value: RumiousListState < T > ;
  key: (item: T) => string;
  templ: (item: T, key: string) => RumiousTemplate;
}