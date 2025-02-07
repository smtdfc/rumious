export class RumiousComponentElement extends HTMLElement {
  constructor() {
    super();
    this.instance = null;
    this.ref = null;
  }

  setRef(ref) {
    this.ref = ref;
  }

  init(componentConstructor, props, wrapped = {}, renderer) {

    this.instance = new componentConstructor();
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
  }
}

export function createComponentElement(name = "a-component") {
  

  window.customElements.define(name, class extends RumiousComponentElement{
    static tag=name;
  });
  
  return document.createElement(name);
}