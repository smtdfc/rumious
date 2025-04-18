import { RumiousRenderTemplate } from "./template.js";
import { RumiousRenderContext } from "./context.js";
import { RumiousDynamicArrayRenderer } from "./array.js";
import { isPrimitive } from "../utils/checkers.js"
import { RumiousState } from "../state/state.js";


export async function dynamicValue(target: HTMLElement, textNode: Text, value: any, context: RumiousRenderContext): Promise<void> {
  const parent = textNode.parentNode;
  if (!parent) return;
  
  if (isPrimitive(value)) {
    textNode.textContent = String(value);
    
  } else if (value && value instanceof RumiousState) {
    textNode.textContent = value.value;
    
    function onValueChange({}) {
      if (document.contains(textNode)) {
        textNode.textContent = value.value;
      } else {
        value.reactor.removeBinding(onValueChange);
      }
    }
    
    value.reactor.addBinding(onValueChange);
    
  } else if (Array.isArray(value)) {
    textNode.textContent = value.map(String).join("");
    
  } else if (value instanceof RumiousDynamicArrayRenderer) {
      value.prepare(textNode.parentElement as HTMLElement,context);
      value.render();
      
  } else if (value instanceof HTMLElement) {
    textNode.replaceWith(value);
    
  } else if (value instanceof RumiousRenderTemplate) {
    let fragment = document.createDocumentFragment();
    context.renderHelper?.(context, value, fragment);
    textNode.replaceWith(fragment);
    
  } else if (value instanceof NodeList || value instanceof HTMLCollection) {
    if (value.length === 0) {
      textNode.remove();
      return;
    }
    
    const fragment = document.createDocumentFragment();
    for (const node of Array.from(value)) {
      fragment.appendChild(node.cloneNode(true));
    }
    textNode.replaceWith(fragment);
    textNode.remove();
    
  } else if (value && typeof value.toString === "function") {
    try {
      textNode.textContent = value.toString();
    } catch {
      textNode.textContent = "";
    }
    
  } else {
    textNode.textContent = "";
    
  }
}