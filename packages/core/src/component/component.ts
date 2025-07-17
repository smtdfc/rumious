import { RenderContext, render } from '../render/index.js';
import type { RenderContent } from '../types/index.js';

export class Component<T extends object> {
  static tagName = 'rumious-component';
  private renderContext: RenderContext;

  constructor(
    protected props: T,
    protected element: HTMLElement,
    parentContext: RenderContext,
  ) {
    this.renderContext = new RenderContext(parentContext.app, this);
    this.onCreate();
  }

  onCreate() {}
  onRender() {}
  onDestroy() {}
  beforeRender() {}
  beforeMount() {}
  onMounted() {}

  template(): RenderContent {
    throw new Error('RumiousRenderError: Cannot render empty component !');
  }

  async requestRender() {
    await this.beforeRender();
    const content = await this.template();
    this.element.textContent = '';
    render(this.element, this.renderContext, content);
    this.onRender();
  }
}

export interface ComponentConstructor<T extends object> {
  new (
    props: T,
    element: HTMLElement,
    parentContext: RenderContext,
  ): Component<T>;
  tagName: string;
}

export type EmptyProps = object;

export class Fragment extends Component<EmptyProps> {
  template(): RenderContent {
    throw new Error(
      'RumiousRenderError: Component must be compile by RumiousCompiler',
    );
  }
}
