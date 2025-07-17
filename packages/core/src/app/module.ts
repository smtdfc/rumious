import type { App } from './app.js';

export class Module {
  constructor(
    public name: string,
    protected app: App,
  ) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static init(app: App, options: any) {
    throw Error('RumiousModuleError: Module is not implement!');
  }

  onBeforeRender() {}

  start() {
    throw Error('RumiousModuleError: Module is not implement!');
  }
}

export interface ModuleConstructor {
  new (app: App, options: any): Module;
}
