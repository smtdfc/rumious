import { RumiousRenderable } from '../types/render.js';
import type { RumiousApp } from '../app/app.js';


export class RumiousRenderContext {
  public target: RumiousRenderable;
  public app ?: RumiousApp;
  constructor(target: RumiousRenderable, app ? : RumiousApp) {
    this.target = target;
    this.app = app;
  }
}