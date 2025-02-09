import {RumiousRenderContext} from '../render/context.js';

export class RumiousComponent {
  constructor() {
    this.element = null;
    this.props = {};
    this.renderContext = new RumiousRenderContext(this);
    this.renderer = null;
    this.wrapped = null;
  }

  prepare(element, props, wrapped = {}, renderer = null) {
    this.element = element;
    this.props = props;
    this.renderer = renderer;
    this.wrapped = wrapped;
  }

  template() {
    return {};
  }

  render(template){
    return this.renderer(template, document.createDocumentFragment(), this.renderContext);
  }
  
  requestRender() {
    let template = this.template();
    let fragment = this.renderer(template, document.createDocumentFragment(), this.renderContext);
    this.element.appendChild(fragment);
    this.onRender();
  }

  async requestCleanUp() {
    if (this.element) {
      let cloned = this.element.cloneNode(true);
      this.element.replaceWith(cloned);
      this.element = cloned;

      while (this.element.firstChild) {
        this.element.removeChild(this.element.firstChild);
      }
    }
  }

  onInit() {}
  onCreate() {}
  onRender() {}
  onUpdate() {}
  onDestroy() {}
}

export function isComponent(component){
  return Object.getPrototypeOf(component) === RumiousComponent;
}