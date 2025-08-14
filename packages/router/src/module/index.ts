import {
  Module,
  App,
  State,
  createComponentElement,
  createState,
} from '@rumious/core';
import type {
  RouterModuleOption,
  RouteComponent,
  RouteComponentLoader,
  RouteSlot,
  RouteConfig,
  RouteData
} from '../types/index.js';
import { BaseStrategy, HashStrategy, HistoryStrategy, MemoryStrategy } from '../strategies/index.js';

export function createLoader(fn: () => RouteComponent): RouteComponentLoader {
  return {
    type: "loader",
    loader: fn
  }
}

export function isLayoutLoader(target: any): target is RouteComponentLoader {
  return target.type === "loader" && typeof target.loader === 'function';
}

export async function resolveLayout(
  layouts: (RouteComponentLoader | RouteComponent)[]
): Promise < RouteComponent[] > {
  let resolvedLayout: RouteComponent[] = [];
  for (let i = 0; i < layouts.length; i++) {
    let layout = layouts[i];
    if (isLayoutLoader(layout)) resolvedLayout.push(await layout.loader());
    else resolvedLayout.push(layout);
  }
  return resolvedLayout;
}

export type RouterEventCallback = () => unknown;
export class RouterModule extends Module {
  private routeData: RouteData = {
    params: createState({}),
    query: null
  }
  
  private strategy: BaseStrategy;
  private currentLayouts: RouteComponent[] = [];
  private routeConfig: RouteConfig[] = [];
  private slots: RouteSlot[] = [
    createState(null)
  ];
  
  private events: Record < string, RouterEventCallback[] > = {}
  constructor(
    protected app: App,
    public options ? : RouterModuleOption
  ) {
    super('router-module', app);
    if (options) {
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
    } else {
      this.strategy = new HashStrategy(this);
    }
  }
  
  on(name: string, callback: RouterEventCallback) {
    if (!this.events[name]) this.events[name] = [];
    this.events[name].push(callback);
  }
  
  off(name: string, callback: RouterEventCallback) {
    if (!this.events[name]) this.events[name] = [];
    this.events[name] = this.events[name].filter(c => c !== callback);
  }
  
  private trigger(name: string) {
    if (!this.events[name]) this.events[name] = [];
    for (let cb of this.events[name]) {
      cb();
    }
  }
  
  redirect(path: string, replace: boolean = false) {
    this.strategy.redirect(path, replace);
  }
  
  route(c: RouteConfig[]) {
    this.routeConfig = c;
  }
  
  diffLayout(layouts: RouteComponent[]): number {
    for (let i = 0; i < Math.max(this.currentLayouts.length, layouts.length); i++) {
      if (this.currentLayouts[i] !== layouts[i]) {
        return i;
      }
    }
    return -1;
  }
  
  async resolvePage(path: string) {
    let layouts: (RouteComponent | RouteComponentLoader)[] = [];
    const url = new URL(path, window.location.origin);
    const query = url.searchParams;
    const pathSplitted = path === "/" ? [""] : path.split("/").filter(Boolean);
    const params: Record < string, string > = {};
    
    const walk = (
      segments: string[],
      routes: RouteConfig[]
    ): boolean => {
      if (segments.length === 0) {
        const indexRoute = routes.find(r => r.path === "");
        if (indexRoute?.component) {
          layouts.push(indexRoute.component);
          return true;
        }
        return false;
      }
      
      const current = segments[0];
      const rest = segments.slice(1);
      
      for (const route of routes) {
        if (route.path === current || route.path.startsWith(":")) {
          if (route.path.startsWith(":")) {
            const key = route.path.slice(1);
            params[key] = current;
          }
          
          if (rest.length === 0 && route.component) {
            layouts.push(route.component);
            return true;
          }
          
          if (route.layout) {
            layouts.push(route.layout);
          }
          
          const matched = walk(rest, route.childs || []);
          if (matched) return true;
          
          // Rollback layout if child failed
          if (route.layout) {
            layouts.pop();
          }
          if (route.path.startsWith(":")) {
            delete params[route.path.slice(1)];
          }
        }
      }
      
      // Fallback wildcard
      const wildcard = routes.find(r => r.path === "**");
      if (wildcard?.component) {
        layouts.push(wildcard.component);
        return true;
      }
      
      return false;
    };
    
    const isMatched = walk(pathSplitted, this.routeConfig);
    
    if (!isMatched) {
      layouts = [];
    }
    
    this.routeData.params.set(params);
    this.routeData.query = query;
    
    let resolvedLayout = await resolveLayout(layouts);
    const changePos = this.diffLayout(resolvedLayout);
    
    if (changePos != -1 && layouts.length > 0) {
      const addition = layouts.length - this.slots.length;
      if (addition > 0) {
        this.slots.push(...Array.from({ length: addition }).map(() => createState(null)));
      }
      this.currentLayouts = resolvedLayout;
      this.buildLayout(changePos);
    }
  }
  
  buildLayout(start: number): RouteSlot {
    let layout: HTMLElement;
    if (!this.currentLayouts[start + 1]) {
      layout = createComponentElement(
        this.currentLayouts[start],
        this.app.renderContext,
        {
          routeSlot: null,
          routeData: this.routeData
        }
      );
    } else {
      let props = {
        routeSlot: this.buildLayout(start + 1),
        routeData: this.routeData
      }
      
      layout = createComponentElement(
        this.currentLayouts[start],
        this.app.renderContext,
        props
      );
    }
    this.slots[start].set(layout);
    return this.slots[start];
  }
  
  start() {
    this.strategy.start();
  }
  
  get rootSlot() {
    return this.slots[0];
  }
}