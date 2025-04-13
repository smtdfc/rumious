import type { RumiousApp } from './app.js';

export interface RumiousModuleInstance {}

export interface RumiousModule {
  init: (app: RumiousApp, options: any) => RumiousModuleInstance;
}