const nodeCache = new WeakMap < Node | DocumentFragment, Map < string, Node >> ();

export function appendChild(
  parent:HTMLElement,
  node:Node | string
){
  if(typeof node === 'string') parent.appendChild(document.createTextNode(node))
  else parent.appendChild(node);
}

export function element(
  parent:HTMLElement,
  tagName:string,
  attrs: Record<string,any>
):HTMLElement{
  let element = document.createElement(tagName);
  parent.appendChild(element);
  return element;
}


export function resolveNode(
  root: Node | DocumentFragment,
  path: number[]
): Node {
  const key = path.join('.');
  let rootCache = nodeCache.get(root);
  
  if (!rootCache) {
    rootCache = new Map();
    nodeCache.set(root, rootCache);
  }
  
  if (rootCache.has(key)) {
    return rootCache.get(key) !;
  }
  
  let node: Node;
  if (root instanceof DocumentFragment) {
    node = root.childNodes[0];
  } else {
    node = root;
  }
  
  for (let idx of path) {
    node = node.childNodes[idx];
  }
  
  rootCache.set(key, node);
  return node;
}

export function replaceNode(oldNode: Node, newNode: Node): void {
  const parent = oldNode.parentNode;
  if (parent) {
    parent.replaceChild(newNode, oldNode);
  } else {
    console.warn('replaceNode: oldNode has no parent. Cannot replace.');
  }
}



interface RumiousEventTarget extends HTMLElement {
  __rumiousEvents ? : Record < string, (e: Event) => void > ;
}

export function createEvent(
  target: RumiousEventTarget,
  name: string,
  callback: (e: Event) => void
) {
  if (!target.__rumiousEvents) {
    target.__rumiousEvents = {};
  }
  target.__rumiousEvents[name] = callback;
}

function triggerEvent(name: string, event: Event) {
  const path = (event.composedPath?.() ?? [event.target]) as EventTarget[];
  
  for (const target of path) {
    if (
      target instanceof HTMLElement &&
      '__rumiousEvents' in target
    ) {
      const element = target as RumiousEventTarget;
      
      const handler = element.__rumiousEvents?.[name];
      if (handler) {
        handler(event);
        break;
      }
    }
  }
}

export function delegateEvents(events: string[]) {
  for (const name of events) {
    window.addEventListener(name, (e) => triggerEvent(name, e));
  }
}