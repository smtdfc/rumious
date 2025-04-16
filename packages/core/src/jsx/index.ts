import { RumiousTemplateGenerator } from "../types/render.js";
import { RumiousRenderTemplate } from "../render/template.js";
import { RumiousRenderContext } from "../render/context.js";
import { directives } from "../render/directives.js";
import { isPrimitive } from "../utils/checkers.js"
import { RumiousComponentConstructor, RumiousComponentElement } from "../component/element.js";
import { RumiousState } from "../state/state.js";

export function template(generator: RumiousTemplateGenerator): RumiousRenderTemplate {
  return new RumiousRenderTemplate(generator);
}

// This is just to satisfy TypeScript's JSX requirement.
// Rumious doesn't use createElement — we do things differently.

function createElement(...args: any[]): any {
  throw Error("Rumious doesn't use createElement !");
}

function addDirective(element: HTMLElement, context: RumiousRenderContext, name: string, modifier: string = "", data: any): void {
  let callback = directives[name];
  if (callback) {
    callback(context, element, modifier, data);
  } else {
    throw Error("Rumious: Cannot solve directive !")
  }
}

function dynamicValue(target: HTMLElement, textNode: Text, value: any, context: RumiousRenderContext): void {
  const parent = textNode.parentNode;
  if (!parent) return;
  
  if (isPrimitive(value)) {
    textNode.textContent = String(value);
  } else if (value && value instanceof RumiousState) {
    textNode.textContent = value.value;
    value.reactor.addBinding(({ target }) => {
      textNode.textContent = target.value;
    });
  } else if (Array.isArray(value)) {
    textNode.textContent = value.map(String).join("");
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

function createComponent(componentConstructor: RumiousComponentConstructor): HTMLElement {
  let tagName = componentConstructor.tagName as string;
  if (!window.customElements.get(tagName)) {
    window.customElements.define(tagName, class extends RumiousComponentElement {
      public static tag = tagName;
    });
  }
  
  return document.createElement(tagName);
}


window.RUMIOUS_JSX = {
  template,
  createElement,
  addDirective,
  dynamicValue,
  createComponent,
}