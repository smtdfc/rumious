import { AuraRenderContext } from '../render/context.js';
import { render } from '../render/index.js';

export class AuraApp {
  constructor(root = document.createElement("span"), configs = {}) {
    this.root = root;
    this.configs = configs;
    this.renderContext = new AuraRenderContext(this);
  }

  render(element) {
    render(element, this.root, this.renderContext);
  }

}