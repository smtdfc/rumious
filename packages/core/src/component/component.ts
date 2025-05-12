import { RumiousApp } from '../app/app.js';
import { RumiousRenderContext } from '../render/context.js';
import { RumiousRenderTemplate } from '../render/template.js';
import { render } from '../render/render.js';
import { RumiousRenderMode } from '../types/render.js';
import { RumiousWarpController } from '../types/warp.js';

export interface RumiousEmptyProps {}

interface RumiousComponentRenderOptions {
  mode: RumiousRenderMode;
  time?: number;
}

export abstract class RumiousComponent<T = unknown> {
  public static classNames = '';
  public static tagName = 'rumious-component';
  public app!: RumiousApp;
  public props!: T;
  public element!: HTMLElement;
  public context!: RumiousRenderContext;
  public renderOptions: RumiousComponentRenderOptions;
  constructor() {
    this.renderOptions = {
      mode: 'idle',
    };
  }

  warp(
    template: RumiousRenderTemplate,
    target: HTMLElement
  ): RumiousWarpController {
    let frag = document.createDocumentFragment();
    render(this.context, template, frag);
    let id = Date.now().toString(32);
    let component = document.createElement('r-wrap');
    component.id = `r-wrap-${id}`;
    component.appendChild(frag);
    target.appendChild(component);
    return {
      id,
      remove: () => component.remove(),
      target,
    };
  }

  render(template: RumiousRenderTemplate): DocumentFragment {
    let frag = document.createDocumentFragment();
    render(this.context, template, frag);
    return frag;
  }

  onCreate(): void {}
  onRender(): void {}
  onDestroy(): void {}
  async onBeforeRender(): Promise<void> {}
  abstract template(): RumiousRenderTemplate;

  prepare(currentContext: RumiousRenderContext, props: T) {
    this.props = props;
    this.context = new RumiousRenderContext(
      this,
      currentContext.app as RumiousApp
    );
  }

  async requestRender() {
    await this.onBeforeRender();
    let template = this.template();
    render(this.context, template, this.element);
    this.onRender();
  }

  requestCleanup() {}
}
