export class AuraComponentElement extends HTMLElement{
  constructor(){
    super();
    this.instance = null;
  }
  
  init(componentConstructor,props,renderer){
    this.instance = new componentConstructor();
    this.instance.prepare(this,props,renderer);
  }
  
  connectedCallback(){
    this.instance.onCreate();
    this.instance.requestRender();
  }
}

export function createComponentElement(){
   return document.createElement("a-component");
}

window.customElements.define("a-component",AuraComponentElement);