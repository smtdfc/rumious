import { RumiousRenderContext } from '../render/index.js';
import { isTemplate } from '../utils/checker.js';
import { RumiousState } from '../state/index.js';
import { RumiousComponentElement } from '../component/index.js';


function handleReactiveNode(
  node: Node,
  value: RumiousState<Node>,
  context: RumiousRenderContext
): Node {
  let currentNode: Node = node;
  
  const update = () => {
    if (!document.contains(currentNode) && value.reactor) {
      value.reactor.removeBinding(update);
      return;
    }
    
    const newNode = value.value;
    if (newNode instanceof RumiousComponentElement) {
      newNode.setContext(context);
    }
    
    currentNode.parentNode?.replaceChild(newNode, currentNode);
    currentNode = newNode;
  };
  
  context.onRendered.push(() => {
    update();
    if (!value.reactor) return;
    value.reactor.addBinding(update);
  });
  return node;
}


function isPrimitive(value: unknown): value is(string | number | boolean | bigint | symbol | null | undefined) {
  return value === null || (typeof value !== 'object' && typeof value !== 'function');
}

export function createDynamicValue(
  context: RumiousRenderContext,
  value: unknown
): Node {
  if (Array.isArray(value)) {
    const fragment = document.createDocumentFragment();
    
    for (const item of value) {
      if (isTemplate(item)) {
        const rendered = item(document.createDocumentFragment(), context);
        fragment.appendChild(rendered);
      } else if (isPrimitive(item)) {
        if (item !== null && item !== undefined && item !== false) {
          fragment.appendChild(document.createTextNode(String(item)));
        }
      }
    }
    
    return fragment;
  }
  
  
  if (isTemplate(value)) {
    return value(document.createDocumentFragment(), context);
  }
  
  if (value instanceof RumiousState && value.reactor) {
    let node = document.createTextNode('');
    context.onRendered.push(() => {
      node.textContent = String(value.get());
      if (!value.reactor) return;
      value.reactor.addBinding((commit) => node.textContent = String(commit.state.get()));
    });
    return node;
  }
  
  if (isPrimitive(value) && value !== null && value !== undefined && value !== false) {
    return document.createTextNode(String(value));
  }
  
  if (value instanceof RumiousState && value.value instanceof Node) {
    return handleReactiveNode(document.createTextNode(''), value, context);
  }
  return document.createTextNode('');
}