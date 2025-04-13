import { RumiousRenderTemplate } from "./template.js";
import { RumiousRenderable } from '../types/render.js';
import type { RumiousApp } from '../app/app.js';
import { directives } from "./directives.js";
import { isPrimitive } from "../utils/checkers.js"

export class RumiousRenderContext {
  public target: RumiousRenderable;
  public app ? : RumiousApp;
  public renderHelper!: (context: RumiousRenderContext, template: RumiousRenderTemplate, target: HTMLElement | HTMLDocument | DocumentFragment) => void;
  
  constructor(target: RumiousRenderable, app ? : RumiousApp) {
    this.target = target;
    this.app = app;
  }
  
  findName(name: string): unknown {
    return (this.target as any)[name];
  }
  
  addDirective(element: HTMLElement, name: string, modifier: string = "", data: any): void {
    let callback = directives[name];
    if (callback) {
      callback(this, element, modifier, data);
    } else {
      throw Error("Rumious: Cannot solve directive !")
    }
  }
  
  dynamicValue(target: HTMLElement, textNode: Text, value: any): void {
    const parent = textNode.parentNode;
    if (!parent) return;
    
    if (isPrimitive(value)) {
      textNode.textContent = String(value);
    } else if (Array.isArray(value)) {
      textNode.textContent = value.map(String).join("");
    } else if (value instanceof HTMLElement) {
      textNode.replaceWith(value);
    } else if (value instanceof RumiousRenderTemplate) {
      let fragment = document.createDocumentFragment();
      this.renderHelper?.(this, value, fragment);
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
  
  
}