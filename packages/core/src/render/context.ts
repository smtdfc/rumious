import { RumiousRenderable } from '../types/render.js';
import type { RumiousApp } from '../app/app.js';
import { directives } from "./directives.js";

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
}