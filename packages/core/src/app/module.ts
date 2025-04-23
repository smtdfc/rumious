import type { RumiousApp } from './app.js';

export interface RumiousModuleInstance {}
export type RumiousModuleOptions<T extends RumiousModule<any>> =
  T extends RumiousModule<infer O> ? O : never;

export type RumiousModule<OptionsType = any> = {
  new (...args: any[]): any;
  init(app: RumiousApp, options?: OptionsType): RumiousModuleInstance;
};
