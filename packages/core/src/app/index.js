import { RumiousRenderContext } from '../render/context.js';
import { render } from '../render/index.js';

export class RumiousApp {
  constructor(root = document.createElement('span'), configs = {}) {
    this.root = root;
    this.app = this;
    this.configs = configs;
    this.renderContext = new RumiousRenderContext(this);
  }

  render(element) {
    this.renderContext.runHooks('onBeforeRender',this.renderContext);
    render(element, this.root, this.renderContext);
    this.renderContext.runHooks('onRendered',this.renderContext);
  }

}

