import type { RumiousApp } from '../app/index.js';
import type { RumiousComponent } from '../component/component.js';

export type RumiousRenderMode = 'idle' | 'async' | 'linear' | 'animate';
export type RumiousRenderable = RumiousComponent | RumiousApp;
export type RumiousTemplateGenerator = (
  root: HTMLElement | HTMLDocument | DocumentFragment,
  context: Record<any, any>
) => HTMLElement | DocumentFragment | HTMLDocument | Node;
