import {
  RumiousApp,
  RumiousModule,
  RumiousComponentConstructor,
  RumiousState,
  renderComponent,
  createState,
} from 'rumious';

import type {
  RumiousRouterRouteConfigs,
  RumiousRouterConfigs,
  RumiousRouterRouteMatchResult,
  RumiousRouterRouteHandler,
  RumiousRouterLayout,
} from './types.js';

import { RumiousRouterHashStrategy } from './strategies/hash.js';
import { RumiousRouterHistoryStrategy } from './strategies/history.js';
import { RumiousRouterMemoryStrategy } from './strategies/memory.js';

import { RumiousRouterEvent } from './event.js';

function isLayoutFunction(
  layout: RumiousRouterLayout
): layout is (
  router: RumiousRouterModule
) => Promise<RumiousComponentConstructor> | RumiousComponentConstructor {
  return typeof layout === 'function' && layout.length > 0;
}

export class RumiousRouterModule extends RumiousModule {
  public currentPath: string;
  public slugs?: Record<string, string>;
  public query?: URLSearchParams;
  public rootInject: RumiousState<HTMLElement | Text | Node>;
  public event: RumiousRouterEvent;
  public routes: Record<string, RumiousRouterRouteConfigs>;
  private strategy:
    | RumiousRouterHashStrategy
    | RumiousRouterHistoryStrategy
    | RumiousRouterMemoryStrategy
    | null;
  private layouts: RumiousRouterLayout[];
  private layoutInstances: RumiousState<HTMLElement | Text | Node>[];
  constructor(
    public app: RumiousApp,
    public configs?: RumiousRouterConfigs
  ) {
    super();
    this.layouts = [];
    this.rootInject = createState(document.createTextNode(''));
    this.event = new RumiousRouterEvent();
    this.layoutInstances = [this.rootInject];
    this.slugs = {};
    this.query = new URLSearchParams();
    this.routes = {};
    this.currentPath = '';
    if (configs?.strategy === 'hash') {
      this.strategy = new RumiousRouterHashStrategy(this);
    } else if (configs?.strategy === 'history') {
      this.strategy = new RumiousRouterHistoryStrategy(this);
    } else if (configs?.strategy === 'memory') {
      this.strategy = new RumiousRouterMemoryStrategy(this);
    } else {
      this.strategy = null;
    }
  }

  private match(pattern: string, path: string): RumiousRouterRouteMatchResult {
    const routeConfig = this.routes[pattern];
    if (!routeConfig)
      return {
        isMatched: false,
        path,
      };

    const paramNames = [...pattern.matchAll(/:([^/]+)/g)].map((m) => m[1]);

    const regexPattern = pattern
      .replace(/:[^/]+/g, '([^/]+)')
      .replace(/\*/g, '.*');

    const regex = new RegExp(`^${regexPattern}$`);
    const match = path.match(regex);

    if (!match)
      return {
        isMatched: false,
        path,
      };

    const params: Record<string, string> = {};
    paramNames.forEach((name, index) => {
      params[name] = match[index + 1];
    });

    return {
      isMatched: true,
      configs: routeConfig,
      slugs: params,
      path,
    };
  }

  private diffLayout(layouts: RumiousRouterLayout[]): number {
    for (let i = 0; i < Math.max(this.layouts.length, layouts.length); i++) {
      if (this.layouts[i] !== layouts[i]) {
        return i;
      }
    }

    return -1;
  }

  async resolve(path: string): Promise<void> {
    let routeMatched!: RumiousRouterRouteMatchResult;
    const url = new URL(path, window.location.origin);

    for (let pattern in this.routes) {
      let result = this.match(pattern, path);
      if (result.isMatched) {
        routeMatched = result;
        break;
      }
    }

    if (!routeMatched) {
      this.event.emit('not_found', {
        router: this,
        path,
      });

      return;
    }

    if (routeMatched.configs?.protect && !routeMatched.configs?.protect(this)) {
      this.event.emit('not_allow', { router: this, path });
      return;
    }
    this.query = url.searchParams;
    this.slugs = routeMatched.slugs;
    const rawLayouts = routeMatched.configs?.layouts || [];
    const normalizedLayouts: RumiousComponentConstructor[] = [];

    for (let i = 0; i < rawLayouts.length; i++) {
      const layout = rawLayouts[i];
      if (isLayoutFunction(layout)) {
        normalizedLayouts[i] = await layout(this);
      } else {
        normalizedLayouts[i] = layout as RumiousComponentConstructor;
      }
    }

    const component = (await routeMatched.configs?.handler?.(
      this,
      routeMatched.slugs as Record<string, string>
    )) as RumiousComponentConstructor;

    const changeIndex = this.diffLayout(normalizedLayouts);
    if (changeIndex !== -1) {
      this.layouts = normalizedLayouts;

      this.layoutInstances = this.layoutInstances.slice(0, changeIndex + 1);
      for (let i = changeIndex; i < normalizedLayouts.length; i++) {
        const layoutState = createState(document.createTextNode(''));
        this.layoutInstances[i + 1] = layoutState;

        const layoutEl = renderComponent(normalizedLayouts[i], {
          router: this,
          route: routeMatched,
          routeSlot: layoutState,
        });

        this.layoutInstances[i].set(layoutEl);
      }
    }

    if (!this.layoutInstances[normalizedLayouts.length]) {
      this.layoutInstances[normalizedLayouts.length] = createState(
        document.createTextNode('')
      );
    }

    const finalComponent = renderComponent(component, {
      router: this,
      route: routeMatched,
      routeSlot: null,
    });

    this.layoutInstances[normalizedLayouts.length].set(finalComponent);
    this.event.emit('page_loaded', routeMatched);
  }

  route(pattern: string, configs: RumiousRouterRouteConfigs): void {
    this.routes[pattern] = configs;
  }

  addRoute(
    pattern: string,
    handler?: RumiousRouterRouteHandler,
    layouts?: RumiousRouterLayout[]
  ): void {
    this.routes[pattern] = {
      handler,
      layouts,
    };
  }

  redirect(path: string, replace: boolean = false): void {
    if (!this.strategy)
      throw new Error(
        'RumiousRouterModuleError: No routing strategy defined. Did you forget to pass configs ?'
      );
    this.strategy.redirect(path, replace);
    this.event.emit('redirect', {
      router: this,
      path,
      replace,
    });
  }

  static init(
    app: RumiousApp,
    opts?: RumiousRouterConfigs
  ): RumiousRouterModule {
    return new RumiousRouterModule(app, opts);
  }

  start(): void {
    if (this.strategy) {
      this.strategy.start();
    } else {
      throw new Error(
        'RumiousRouterModuleError: No routing strategy defined. Did you forget to pass configs ?'
      );
    }
  }
}
