import type { RumiousRenderContext } from '../render/index.js';

export interface RumiousTemplate {
  (root: HTMLElement | DocumentFragment, context: RumiousRenderContext): HTMLElement;
  __isTemplate: true;
}

