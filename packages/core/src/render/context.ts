import { RumiousRenderable } from '../types/render.js';
import type { RumiousApp } from '../app/app.js';
import type { RumiousRenderTemplate } from "./template.js";


export class RumiousRenderContext {
  public target: RumiousRenderable;
  public app ? : RumiousApp;
  public renderHelper!: (context: RumiousRenderContext, template: RumiousRenderTemplate, target: HTMLElement | HTMLDocument | DocumentFragment) => void;
  public onRenderFinished:Array<Function>;
  
  constructor(target: RumiousRenderable, app ? : RumiousApp) {
    this.target = target;
    this.app = app;
    this.onRenderFinished=[];
  }
  
  findName(name: string): unknown {
    return (this.target as any)[name];
  }
  
  
}