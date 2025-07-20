import { RenderContext, render,renderFrag } from '../render/index.js';
import type { RenderContent } from '../types/index.js';
import type { State } from '../state/index.js';

export class Component<T extends object> {
  static tagName = 'rumious-component';
  private renderContext: RenderContext;
  public children: RenderContent | null = null;

  constructor(
    protected props: T,
    protected element: HTMLElement,
    parentContext: RenderContext,
  ) {
    this.renderContext = new RenderContext(parentContext.app, this);
    this.onCreate();
  }

  mountTo(
    target:HTMLElement,
    content:RenderContent
  ){
   target.appendChild(renderFrag(this.renderContext, content));
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

export type ForProps<T> = {
  template: (value: T) => RenderContent;
  list: State<T[]>;
};

export class For extends Component<ForProps<unknown>> {
  template(): RenderContent {
    throw new Error(
      'RumiousRenderError: Component must be compile by RumiousCompiler',
    );
  }
}

export type IfProps<T> = {
  onFalse?: RenderContent;
  onTrue?: RenderContent;
  condition: State<T> | T;
};

export class If extends Component<IfProps<unknown>> {
  template(): RenderContent {
    throw new Error(
      'RumiousRenderError: Component must be compile by RumiousCompiler',
    );
  }
}
