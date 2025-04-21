import { RumiousRenderContext } from './context.js';

type RumiousDymanicInjectorContentTypes = HTMLElement | string;

export class RumiousDymanicInjector<
  T extends RumiousDymanicInjectorContentTypes,
> {
  private targets: Map<HTMLElement, any>;
  private type: 'string' | 'element';

  constructor(public contents?: T[]) {
    this.targets = new Map();

    if (!contents || contents.length === 0) {
      throw new Error('Injector must be initialized with non-empty content');
    }

    const first = contents[0];
    this.type = typeof first === 'string' ? 'string' : 'element';
  }

  addTarget(element: HTMLElement): void {
    this.targets.set(element, 1);
  }

  inject(element: HTMLElement): void {
    if (!this.targets.has(element)) return;
    if (!this.contents) return;

    element.innerHTML = '';

    if (this.type === 'string') {
      for (const content of this.contents as string[]) {
        element.insertAdjacentHTML('beforeend', content);
      }
    } else {
      for (const content of this.contents as HTMLElement[]) {
        element.appendChild(content);
      }
    }
  }

  injectAll(): void {
    for (const target of this.targets.keys()) {
      this.inject(target);
    }
  }

  removeTarget(element: HTMLElement): void {
    this.targets.delete(element);
  }

  clear(): void {
    this.targets.clear();
  }
}

export function createHTMLInjector(
  html: string
): RumiousDymanicInjector<string> {
  return new RumiousDymanicInjector<string>([html]);
}
