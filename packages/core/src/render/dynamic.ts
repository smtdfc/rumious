import { RumiousRenderTemplate } from './template.js';
import { RumiousRenderContext } from './context.js';
import { RumiousListRenderer } from './struct.js';
import { isPrimitive } from '../utils/checkers.js';
import { RumiousState } from '../state/state.js';
import { RumiousComponentElement } from '../component/element.js';

function handlePrimitive(textNode: Text, value: any) {
  textNode.textContent = String(value);
}

function handleReactiveNode(
  textNode: Text,
  value: RumiousState,
  context: RumiousRenderContext
) {
  let currentNode: Node = textNode;
  
  const update = () => {
    if (!document.contains(currentNode)) {
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
  
  update();
  value.reactor.addBinding(update);
}

function handleReactiveText(textNode: Text, value: RumiousState) {
  const update = () => {
    if (!document.contains(textNode)) {
      value.reactor.removeBinding(update);
      return;
    }
    textNode.textContent = String(value.value);
  };
  
  update();
  value.reactor.addBinding(update);
}

function handleRenderTemplate(
  textNode: Text,
  template: RumiousRenderTemplate,
  context: RumiousRenderContext
) {
  const fragment = document.createDocumentFragment();
  context.renderHelper?.(context, template, fragment);
  textNode.replaceWith(fragment);
}

function handleNodeList(textNode: Text, value: NodeList | HTMLCollection) {
  const fragment = document.createDocumentFragment();
  for (const node of Array.from(value)) {
    fragment.appendChild(node.cloneNode(true));
  }
  textNode.replaceWith(fragment);
}

function handleArray(
  textNode: Text,
  value: any[],
  context: RumiousRenderContext
) {
  const fragment = document.createDocumentFragment();
  
  for (const item of value) {
    if (item instanceof RumiousRenderTemplate) {
      context.renderHelper?.(context, item, fragment);
    } else if (isPrimitive(item)) {
      fragment.appendChild(document.createTextNode(String(item)));
    } else if (item instanceof Node) {
      fragment.appendChild(item.cloneNode(true));
    }
  }
  
  textNode.replaceWith(fragment);
}

export async function dynamicValue(
  target: HTMLElement,
  textNode: Text,
  value: any,
  context: RumiousRenderContext
): Promise < void > {
  const parent = textNode.parentNode;
  if (!parent) return;
  
  if (isPrimitive(value)) {
    handlePrimitive(textNode, value);
  } else if (value instanceof RumiousState && value.value instanceof Node) {
    handleReactiveNode(textNode, value, context);
  } else if (value instanceof RumiousState) {
    handleReactiveText(textNode, value);
  } else if (Array.isArray(value)) {
    handleArray(textNode, value, context);
  } else if (value instanceof RumiousListRenderer) {
    value.prepare(textNode.parentElement as HTMLElement, context);
    value.render();
    textNode.remove();
  } else if (value instanceof HTMLElement) {
    textNode.replaceWith(value);
  } else if (value instanceof RumiousRenderTemplate) {
    handleRenderTemplate(textNode, value, context);
  } else if (value instanceof NodeList || value instanceof HTMLCollection) {
    if (value.length > 0) {
      handleNodeList(textNode, value);
    } else {
      textNode.remove();
    }
  } else if (value && typeof value.toString === 'function') {
    try {
      textNode.textContent = value.toString();
    } catch {
      textNode.textContent = '';
    }
  } else {
    textNode.textContent = '';
  }
}