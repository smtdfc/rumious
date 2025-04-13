import { RumiousRenderable } from '../types/render.js';
import { directives } from "./directives.js";
import type { RumiousApp } from '../app/app.js';
import { isPrimitive } from "../utils/checkers.js"


export class RumiousRenderContext {
  public target: RumiousRenderable;
  public app ? : RumiousApp;
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
    if (isPrimitive(value)) {
      textNode.textContent = String(value);
    } else if (Array.isArray(value)) {
      textNode.textContent = value.map(String).join("");
    } else if (typeof value === "function") {
      textNode.textContent = String(value());
    } else if (value && typeof value.toString === "function") {
      textNode.textContent = value.toString();
    } else {
      textNode.textContent = "";
    }
  }
}