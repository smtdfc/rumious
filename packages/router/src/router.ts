import {
  RumiousApp,
  RumiousModule,
  RumiousComponentConstructor,
} from 'rumious';

import type {
  RumiousRouterRouteConfigs,
  RumiousRouterConfigs,
  RumiousRouterRouteMatchResult,
  RumiousRouterRouteHandler,
} from "./types.js";

import { RumiousRouterHashStrategy } from "./strategies/hash.js";
import { RumiousRouterEvent } from "./event.js";

export class RumiousRouterModule extends RumiousModule{
  public currentPath: string;
  public event:RumiousRouterEvent;
  public routes: Record < string, RumiousRouterRouteConfigs > ;
  private strategy: RumiousRouterHashStrategy | null;
  constructor(
    public app: RumiousApp,
    public configs ? : RumiousRouterConfigs
  ) {
    super();
    this.event = new RumiousRouterEvent();
    this.routes = {};
    this.currentPath = "";
    if (configs?.strategy === "hash") {
      this.strategy = new RumiousRouterHashStrategy(this);
    } else {
      this.strategy = null;
    }
  }
  
  match(pattern: string, path: string): RumiousRouterRouteMatchResult {
    const routeConfig = this.routes[pattern];
    if (!routeConfig) return {
      isMatched: false,
      path
    };;
    
    const paramNames = [...pattern.matchAll(/:([^/]+)/g)].map(m => m[1]);
    
    const regexPattern = pattern
      .replace(/:[^/]+/g, '([^/]+)')
      .replace(/\*/g, '.*');
    
    const regex = new RegExp(`^${regexPattern}$`);
    const match = path.match(regex);
    
    if (!match) return {
      isMatched: false,
      path
    };
    
    const params: Record < string, string > = {};
    paramNames.forEach((name, index) => {
      params[name] = match[index + 1];
    });
    
    return {
      isMatched: true,
      configs: routeConfig,
      slugs: paramNames,
      path
    };
  }
  
  addRoute(pattern: string, handler ? : RumiousRouterRouteHandler): void {
    this.routes[pattern] = {
      handler
    }
  }
  
  static init(
    app: RumiousApp,
    opts ? : RumiousRouterConfigs
  ): RumiousRouterModule {
    return new RumiousRouterModule(app, opts);
  }
  
  start(): void {
    if (this.strategy) {
      this.strategy.start();
    } else {
      throw new Error("RumiousRouterModuleError: No routing strategy defined. Did you forget to pass configs to init()?");
    }
  }
}