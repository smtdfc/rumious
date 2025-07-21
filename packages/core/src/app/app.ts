import type { AppConfig, RenderContent } from '../types/index.js';
import { Module, ModuleConstructor } from './module.js';
import { RenderContext, render } from '../render/index.js';

type AppHookCallback = (data: any) => any;
interface AppHook {
  [n: string]: AppHookCallback[];
  onStart: AppHookCallback[];
  onModuleAdded: AppHookCallback[];
  onModuleStart: AppHookCallback[];
}

export const EVENT_DELEGATION: string[] = [];
export const APP_SYMBOL: unique symbol = Symbol('AppSymbol');
export const EVENT_DELEGATE_SYMBOL: unique symbol = Symbol(
  'EventDelegateSymbol',
);
export class App {
  private rootLayout: RenderContent | null = null;
  public renderContext = new RenderContext(this, this);
  private hooks: AppHook = {
    onStart: [],
    onModuleAdded: [],
    onModuleStart: [],
  };
  private modules: Record<string, Module> = {};
  [APP_SYMBOL]: unknown = {
    instance: this,
  };

  constructor(public config: AppConfig) {}

  addModule(
    Constructor: ModuleConstructor,

    options: any = {},
  ): Module {
    const instance = new Constructor(this, options);
    if (this.modules[instance.name])
      console.warn(`RumiousWarn: Module ${instance.name} has existed!`);
    this.modules[instance.name] = instance;
    this.triggerHook('onModuleAdded', {
      name: instance.name,
      instance,
    });
    return instance;
  }

  private triggerHook(name: string, data: any) {
    if (this.hooks[name]) {
      for (let i = 0; i < this.hooks[name].length; i++) {
        this.hooks[name][i](data);
      }
    }
  }

  setRootLayout(layout: any) {
    this.rootLayout = layout;
  }

  start() {
    for (const name in this.modules) {
      this.modules[name].onBeforeRender();
    }

    //render
    if (this.rootLayout) {
      //const start = performance.now();
      render(this.config.root, this.renderContext, this.rootLayout);
      //const end = performance.now();
      //console.log(end - start);
    }

    //start modules
    for (const name in this.modules) {
      this.modules[name].start();
    }
    this.triggerHook('onModuleStart', { app: this });
    this.triggerHook('onStart', { app: this });
  }
}

export function createApp(config: AppConfig): App {
  return new App(config);
}
