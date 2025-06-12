import type { RumiousComponent } from '../component/index.js';

export interface RumiousComponentConstructor<T = any> {
  new(): RumiousComponent<T>;
  tagName: string | 'rumious-component';
}