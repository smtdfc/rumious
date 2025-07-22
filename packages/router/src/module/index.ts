import {
  Module,
  App,
  State,
  createComponentElement,
  createState,
} from '@rumious/core';
import type {
  RouterModuleOption,
  RouteMap,
  RouteConfig,
  RouteLayout,
  RouteComponent,
} from '../types/index.js';
import { BaseStrategy, HashStrategy, HistoryStrategy, MemoryStrategy } from '../strategies/index.js';

function isLayoutFactory(l: RouteLayout): l is() => RouteComponent < object > {
  return (
    typeof l === 'function' &&
    !/^class\s/.test(Function.prototype.toString.call(l))
  );
}

export type RouterModuleEventCallback = () => unknown;

export class RouterModule extends Module {
  public routes: RouteMap = new Map < string, RouteConfig > ();
  public strategy: BaseStrategy;
  public params: State < Record < string, any >> = createState({});
  public events = new Map < string, RouterModuleEventCallback[] > ();
  public slots: State < HTMLElement | null > [] = [createState(null)];
  public currentLayout: RouteComponent < object > [] = [];
  
  constructor(
    protected app: App,
    public options: RouterModuleOption = {
      strategy: 'hash',
    },
  ) {
    super('router-module', app);
    
    if (options.strategy === 'hash') {
      this.strategy = new HashStrategy(this);
    } else if (options.strategy === 'history') {
      this.strategy = new HistoryStrategy(this);
    } else if (options.strategy === 'memory') {
      this.strategy = new MemoryStrategy(this);
    } else {
      throw new Error(
        `RuniousRouterModuleError: Unsupported strategy ${options.strategy}`,
      );
    }
  }
  
  emit(name: string) {
    const cbs = this.events.get(name);
    if (!cbs) return;
    for (const cb of cbs) cb();
  }
  
  on(name: string, callback: RouterModuleEventCallback) {
    let cbs = this.events.get(name);
    if (!cbs) {
      cbs = [];
      this.events.set(name, cbs);
    }
    cbs.push(callback);
  }
  
  off(name: string, callback: RouterModuleEventCallback) {
    const cbs = this.events.get(name);
    if (!cbs) return;
    this.events.set(
      name,
      cbs.filter((cb) => cb !== callback),
    );
  }
  
  setLayout(layouts: RouteComponent < object > []): number {
    let changePos = -1;
    for (let i = 0; i < layouts.length; i++) {
      if (this.currentLayout[i] !== layouts[i]) {
        changePos = i;
        break;
      }
    }
    
    if (changePos === -1) return -1;
    for (let i = 0; i < layouts.length + 1; i++) {
      if (!this.slots[i]) this.slots[i] = createState(null);
    }
    
    const element = this.buildNestedLayout(layouts, changePos);
    
    this.slots[changePos].set(element);
    this.currentLayout = layouts;
    return changePos;
  }
  
  buildNestedLayout(
    layouts: RouteComponent < object > [],
    idx: number,
  ): HTMLElement {
    const layout = layouts[idx];
    
    if (idx + 1 < layouts.length) {
      const nested = this.buildNestedLayout(layouts, idx + 1);
      
      this.slots[idx + 1].set(nested);
      
      return createComponentElement(layout, this.app.renderContext, {
        routeSlot: this.slots[idx + 1],
        routeParams: this.params,
      });
    }
    
    this.slots[idx + 1].set(null);
    
    return createComponentElement(layout, this.app.renderContext, {
      routeSlot: this.slots[idx + 1],
      routeParams: this.params,
    });
  }
  
  resolveLayout(layouts: RouteLayout[]): RouteComponent < object > [] {
    const layoutComponents = [];
    for (const l of layouts) {
      if (isLayoutFactory(l)) layoutComponents.push(l());
      else layoutComponents.push(l);
    }
    
    return layoutComponents;
  }
  
  resolveRoute(
    path: string,
  ): [boolean, RouteConfig | null, Record < string, any > ] {
    let passed = false;
    let params: Record < string, any > = {};
    let routePassed: string = '';
    const splitted = path.split('/').filter(Boolean);
    const routes = Array.from(this.routes.keys());
    
    for (let i = 0; i < routes.length; i++) {
      const routeSplitted = routes[i].split('/').filter(Boolean);
      routePassed = routes[i];
      params = {};
      const isWildcard = routeSplitted[routeSplitted.length - 1] === '*';
      const lenToCheck = isWildcard ?
        routeSplitted.length - 1 :
        routeSplitted.length;
      
      if (splitted.length < lenToCheck) continue;
      
      let match = true;
      for (let j = 0; j < lenToCheck; j++) {
        const routePart = routeSplitted[j];
        const pathPart = splitted[j];
        
        if (routePart.startsWith(':')) {
          const key = routePart.slice(1);
          params[key] = pathPart;
        } else if (routePart !== pathPart) {
          match = false;
          break;
        }
      }
      
      if (match && (isWildcard || lenToCheck === splitted.length)) {
        passed = true;
        break;
      }
    }
    
    if (passed) {
      return [passed, this.routes.get(routePassed) ?? null, params];
    }
    
    return [false, null, params];
  }
  
  resolvePage(path: string) {
    const url = new URL(path, window.location.origin);
    
    this.emit('page_change');
    const [passed, config, params] = this.resolveRoute(url.pathname);
    this.params.set(params);
    if (passed && config) {
      this.emit('page_matched');
      this.setLayout(
        this.resolveLayout([...(config.layout ?? []), config.component]),
      );
      this.emit('page_loaded');
    } else {
      this.emit('not_found');
    }
  }
  
  route(path: string, component: RouteLayout, layout ? : RouteLayout[]) {
    this.routes.set(path, {
      component,
      layout,
    });
  }
  
  onBeforeRender() {}
  
  redirect(path: string, replace: boolean = false) {
    this.strategy.redirect(path, replace);
  }
  
  start() {
    this.strategy.start();
  }
  
  get rootSlot() {
    return this.slots[0];
  }
}