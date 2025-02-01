import { RumiousRenderContext } from '../render/context.js';

export class RumiousComponent {
  constructor() {
    this.element = null;
    this.props = {};
    this.renderContext = new RumiousRenderContext(this);
    this.renderer = null;
  }

  prepare(element, props, renderer = null) {
    this.element = element;
    this.props = props;
    this.renderer = renderer;
  }

  template() { return {}; }

  requestRender() {
    let template = this.template();
    let fragment = this.renderer(template, document.createDocumentFragment(), this.renderContext);
    this.element.appendChild(fragment);
  }

  onCreate() {}
  onRender() {}
  onUpdate() {}
  onDestroy() {}
}

export function isComponent(constructor) {
  return Object.getPrototypeOf(constructor) === RumiousComponent;
}