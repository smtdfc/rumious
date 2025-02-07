export class RumiousComponentElement extends HTMLElement {
  constructor() {
    super();
    this.instance = null;
    this.ref = null;
  }

  cleanUp(){}
  
  setRef(ref) {
    this.ref = ref;
  }

  init(componentConstructor, props, wrapped = {}, renderer) {
    this.instance = new componentConstructor();
    this.instance.element = this;
    this.instance.prepare(this, props, wrapped, renderer);
    this.instance.onInit();
  }

  connectedCallback() {
    this.instance.onCreate();
    this.instance.requestRender();
    this.instance.forwardRef = this.ref ?? {};
  }

  disconnectCallback() {
    this.instance.onDestroy();
    this.instance.requestCleanUp();
    this.cleanUp();
  }
}

export function createComponentElement(name = "a-component") {
  
  window.customElements.define(name, class extends RumiousComponentElement{
    static tag=name;
    cleanUp(){
      window.customElements(name, HTMLUnknownElement);
    }
  });
  
  return document.createElement(name);
}