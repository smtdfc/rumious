import { RumiousComponentConstructor,RumiousTemplate } from '../types/index.js';
import { RumiousRenderContext } from '../render/index.js';
import type { RumiousComponent } from './component.js';


export class RumiousComponentElement < T > extends HTMLElement {
  public component!: RumiousComponentConstructor < T > ;
  public props!: T;
  public context!: RumiousRenderContext;
  public instance!: RumiousComponent;
  public slotTempl:RumiousTemplate | null = null;
  constructor() {
    super()
  }
  
  setContext(context: RumiousRenderContext){
    this.context = context;
  }
  
  async connectedCallback() {
    let instance = new this.component();
    this.instance = instance;
    this.instance.slot = this.slotTempl;
    instance.prepare(
      this.props,
      this.context,
      this
    );
    instance.onCreate();
    await instance.beforeRender();
    instance.requestRender();
    instance.onRender();
  }
  
  disconnectedCallback() {
    this.instance.onDestroy();
  }
  
  setSlot(templ:RumiousTemplate){
    this.slotTempl = templ;
  }
}

export function createComponentElement < T > (
  context: RumiousRenderContext,
  component: RumiousComponentConstructor < T > ,
  props: T
): [HTMLElement] {
  if (!window.customElements.get(component.tagName)) {
    window.customElements.define(
      component.tagName,
      class extends RumiousComponentElement < T > {}
    );
  }
  
  const element = document.createElement(component.tagName) as RumiousComponentElement < T > ;
  element.component = component;
  element.props = props;
  element.context = context;
  return [element];
}

export function renderComponent < T > (
  component: RumiousComponentConstructor < T > ,
  props: T
): HTMLElement {
  if (!window.customElements.get(component.tagName)) {
    window.customElements.define(
      component.tagName,
      class extends RumiousComponentElement < T > {}
    );
  }
  
  const element = document.createElement(component.tagName) as RumiousComponentElement < T > ;
  element.component = component;
  element.props = props;
  
  return element;
}