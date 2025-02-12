export class RumiousComponentElement extends HTMLElement {
  constructor() {
    super();
    this.instance = null;
    this.ref = null;
  }

  cleanUp() {
    Object.setPrototypeOf(this, HTMLUnknownElement.prototype);
    this.remove();
  }

  init(componentConstructor, props, wrapped = {}, renderer, app) {
    this.instance = new componentConstructor();
    this.instance.element = this;
    this.instance.app = app;
    this.instance.prepare(this, props, wrapped, renderer);
    this.instance.onInit();
  }

  connectedCallback() {
    if (this.instance.asynchronousRender) {
      (async () => {
        this.instance.onCreate();
        this.instance.requestRender();
      })();
    } else {
      this.instance.onCreate();
      this.instance.requestRender();
    }
  }

  disconnectedCallback() {
    this.instance.onDestroy();
    this.instance.requestCleanUp();
    this.cleanUp();
  }
}

export function createComponentElement(name = 'r-component') {
  if (!window.customElements.get(name)) {
    window.customElements.define(name, class extends RumiousComponentElement {
      static tag = name;
    });
  }

  return document.createElement(name);
}