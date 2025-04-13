import { RumiousApp } from '../app/app.js'
import { RumiousRenderContext } from '../render/context.js'
import { RumiousRenderTemplate } from '../render/template.js';
import { render } from '../render/render.js';
import { Constructor } from '../utils/types.js';


export abstract class RumiousComponent < T = unknown > {
  public app!: RumiousApp;
  public props!: T;
  public element!: HTMLElement;
  public context!: RumiousRenderContext;
  constructor() {}
  
  abstract onCreate(): void;
  abstract onBeforeRender(): void;
  abstract onRender(): void;
  abstract onDestroy(): void;
  abstract template(): RumiousRenderTemplate;
  
  prepare(currentContext: RumiousRenderContext) {
    this.context = new RumiousRenderContext(this, currentContext.app as RumiousApp);
  }
  
  requestRender() {
    let template = this.template();
    render(this.context, template, this.element);
  }
  
  requestCleanup() {
    
  }
  
}