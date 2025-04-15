import type { RumiousComponent } from "./component.js";
import { RumiousRenderContext } from "../render/context.js";
import { Constructor } from '../types/utils.js';

export type RumiousComponentConstructor = Constructor < RumiousComponent > & {
  classNames ? : string;
  tagName ?: string;
};

export class RumiousComponentElement extends HTMLElement {
  public componentConstructor!: RumiousComponentConstructor;
  private componentInstance!: RumiousComponent;
  private context!: RumiousRenderContext;
  public props: Record < string, any > ;
  
  constructor() {
    super();
    this.props = {};
  }
  
  setup(context: RumiousRenderContext, componentConstructor: RumiousComponentConstructor) {
    this.context = context;
    this.componentConstructor = componentConstructor;
  }
  
  connectedCallback() {
    if (!this.componentConstructor) {
      console.warn("Rumious: Cannot find matching component constructor.");
      return;
    }
    
    this.componentInstance = new this.componentConstructor();
    this.componentInstance.element = this;
    
    // Check and access static classNames property
    if (this.componentConstructor.classNames) {
      this.className = this.componentConstructor.classNames;
    }
    
    this.componentInstance.prepare(this.context, this.props);
    this.componentInstance.onCreate();
    this.componentInstance.requestRender();
  }
  
  disconnectedCallback() {
    this.componentInstance?.onDestroy();
  }
}
