import type { RumiousRenderTemplate } from '../render/template.js';

export interface RumiousJSXFactory {
  template(...args: any[]): RumiousRenderTemplate;
  createElement(...args: any[]): RumiousRenderTemplate;
  addDirective(...args: any[]): void;
  dynamicValue(...args: any[]): void;
  createComponent(...args: any[]): HTMLElement;
}
