import type { App } from './app.js';

export class Module {
  constructor(
    public name: string,
    protected app: App,
  ) {}

  onBeforeRender() {}

  start() {
    throw Error('RumiousModuleError: Module is not implement!');
  }
}

export type ModuleConstructor<T extends Module = Module> = new (
  app: App,
  options?: any,
) => T;
