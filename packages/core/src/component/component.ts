import { RumiousTemplate } from '../types/index.js';
import { RumiousRenderContext, render, RumiousViewControl, createViewControl } from '../render/index.js';
import { RumiousApp } from '../app/index.js';
import { RumiousRef } from '../ref/index.js';

export class RumiousComponent < T = any > {
  public props!: T;
  public app!: RumiousApp;
  public element!: HTMLElement;
  public context!: RumiousRenderContext;
  public slot: RumiousTemplate | null = null;
  static tagName = 'rumious-component';
  
  constructor() {}
  
  createViewControl(): RumiousViewControl {
    return createViewControl();
  }
  
  mountTo(
    template: RumiousTemplate,
    target: HTMLElement,
  ): HTMLElement {
    return render(
      template,
      target,
      this.context
    );
  }
  
  prepare(
    props: T,
    context: RumiousRenderContext,
    element: HTMLElement
  ) {
    this.app = context.app;
    this.element = element;
    this.props = props;
    this.context = new RumiousRenderContext(
      context.app,
      this
    );
  }
  
  template(): RumiousTemplate {
    throw new Error(`RumiousRenderError: Cannot render empty component !`);
  }
  
  requestRender() {
    let template = this.template();
    render(
      template,
      this.element,
      this.context
    );
  }
  
  remove() {
    this.element.remove();
  }
  
  onCreate() {}
  onRender() {}
  onDestroy() {}
  beforeRender() {}
  
  renderTo(
    target: HTMLElement | RumiousRef,
    template: RumiousTemplate
  ) {
    if (target instanceof HTMLElement) {
      render(
        template,
        target,
        this.context
      );
    } else if (target instanceof RumiousRef && target.isMounted()) {
      render(
        template,
        target.element,
        this.context
      );
    }
  }
  
}

export class Fragment extends RumiousComponent < any > {
  
}