import type { RumiousComponent } from "./component.js";
import { RumiousRenderContext } from "../render/context.js";
import { Constructor } from '../types/utils.js';


export class RumiousComponentElement extends HTMLElement {
  public componentConstructor!: Constructor < RumiousComponent > ;
  private componentInstance!: RumiousComponent;
  private context!: RumiousRenderContext;
  public props: Record < string, any > ;
  
  constructor() {
    super();
    this.props = {};
  }
  
  setup(context: RumiousRenderContext, componentConstructor: Constructor < RumiousComponent > ) {
    this.context = context;
    this.componentConstructor = componentConstructor;
  }
  
  connectedCallback() {
    if (!this.componentConstructor) {
      console.warn("RumiousComponentElement: Cannot find matching component constructor .");
      return;
    }
    
    this.componentInstance = new this.componentConstructor();
    this.componentInstance.element = this;
    this.componentInstance.prepare(this.context,this.props);
    this.componentInstance.onCreate();
    this.componentInstance.requestRender();
  }
  
  disconnectedCallback(){
    this.componentInstance?.onDestroy();
  }
}

customElements.define("rumious-component", RumiousComponentElement);