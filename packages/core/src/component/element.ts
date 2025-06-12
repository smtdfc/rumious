import { RumiousComponentConstructor } from '../types/index.js';
import { RumiousRenderContext } from '../render/index.js';
import type { RumiousComponent } from './component.js';


export class RumiousComponentElement < T > extends HTMLElement {
  public component!: RumiousComponentConstructor < T > ;
  public props!: T;
  public context!: RumiousRenderContext;
  public instance!: RumiousComponent;
  constructor() {
    super()
  }
  
  setContext(context: RumiousRenderContext){
    this.context = context;
  }
  
  async connectedCallback() {
    let instance = new this.component();
    this.instance = instance;
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
}

export function createComponentElement < T > (
  context: RumiousRenderContext,
  component: RumiousComponentConstructor < T > ,
  props: T
): HTMLElement {
  if (!window.customElements.get(component.tagName)) {
    window.customElements.define(component.tagName, class extends RumiousComponentElement < T > {
      constructor() {
        super()
        this.component = component;
        this.props = props;
        this.context = context;
      }
    });
  }
  
  let element = document.createElement(component.tagName);
  return element;
  
}

export function renderComponent < T > (
  component: RumiousComponentConstructor < T > ,
  props: T
): HTMLElement {
  if (!window.customElements.get(component.tagName)) {
    window.customElements.define(component.tagName, class extends RumiousComponentElement < T > {
      constructor() {
        super()
        this.component = component;
        this.props = props;
      }
    });
  }
  
  let element = document.createElement(component.tagName);
  return element;
  
}