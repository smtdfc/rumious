import { RumiousRenderContext } from '../render/context.js';
import { render } from '../render/index.js';

export class RumiousApp {
  constructor(root = document.createElement('span'), configs = {}) {
    this.root = root;
    this.configs = configs;
    this.renderContext = new RumiousRenderContext(this);
  }

  render(element) {
    render(element, this.root, this.renderContext);
  }

}