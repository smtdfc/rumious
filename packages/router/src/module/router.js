import { createContext, RumiousDymanicInjector } from 'rumious';

class RouterLazyLoad {
  constructor(callback) {
    this.callback = callback;
    this.component = null;
  }

  async load() {
    if (!this.component) {
      this.component = (await this.callback()).Page;
    }
    return this.component;
  }
}

export function routerLazy(callback) {
  return new RouterLazyLoad(callback);
}

function pathDiff(pattern, path) {
  let params = {};
  let patternParts = pattern.split('/');
  let pathParts = path.split('/');

  let i = 0, j = 0;
  while (i < patternParts.length && j < pathParts.length) {
    if (patternParts[i] === '*') return params;
    if (patternParts[i].startsWith(':')) {
      params[patternParts[i].slice(1)] = pathParts[j];
    } else if (patternParts[i] !== pathParts[j]) {
      return null;
    }
    i++;
    j++;
  }

  return i === patternParts.length && j === pathParts.length ? params : null;
}

function diffLayout(a, b) {
  let len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    if (a[i] !== b[i]) return { pos: i, change: b.slice(i) };
  }
  return a.length < b.length ? { pos: a.length, change: b.slice(a.length) } : { pos: -1 };
}

export class RumiousRouterModule {
  constructor(app, options = {}) {
    this.app = app;
    this.routes = options.routes ?? {};
    this.wrappers = options.wrappers ?? {};
    this.strategy = new options.strategy(this);
    this.context = createContext(`router_${Date.now()}`, {});
    this.injectors = [new RumiousDymanicInjector()];
    this.currentComponents = [];
    this.params = {};
    this.events = {};
    this.shouldReinject = false;
  }

  static init(app, options) {
    return new RumiousRouterModule(app, options);
  }

  get rootInjector() {
    return this.injectors[0];
  }

  on(name, callback) {
    if (!this.events[name]) this.events[name] = [];
    this.events[name].push(callback);
  }

  off(name, callback) {
    if (!this.events[name]) return;
    this.events[name] = this.events[name].filter(cb => cb !== callback);
  }

  triggerEvent(name, data) {
    if (!this.events[name]) return;
    this.events[name].forEach(callback => callback(data));
  }

  resolve(url = new URL('/', window.location.origin)) {
    for (let pattern in this.routes) {
      let routeConfigs = this.routes[pattern];
      let diffResult = pathDiff(pattern, url.pathname);
      if (diffResult) {
        return {
          type: "success",
          routeConfigs,
          params: diffResult,
          pattern,
          url
        };
      }
    }
    return { type: "error", name: "not_found" };
  }

  async solveWrapper(url) {
    if (this.cachedWrappers?.url === url.pathname) return this.cachedWrappers.components;

    let components = [];
    for (let pattern in this.wrappers) {
      if (pathDiff(pattern, url.pathname)) {
        components.push(...this.wrappers[pattern]);
      }
    }

    this.cachedWrappers = { url: url.pathname, components };
    return components;
  }

  async render(routeData) {
    let { routeConfigs, url, params } = routeData;
    this.params = params;
    let components = routeConfigs.components;
    let useWrapper = routeConfigs.wrap ?? true;
    if (routeConfigs.protect && !await routeConfigs.protect()) {
      return { type: "error", name: "not_allowed" };
    }

    if (routeConfigs.redirect) {
      this.redirect(
        typeof routeConfigs.redirect === "function" ? await routeConfigs.redirect() : routeConfigs.redirect
      );
      return {};
    }

    let wrappers = useWrapper ? await this.solveWrapper(url) : [];
    for (let i = 0; i < components.length; i++) {
      if (components[i] instanceof RouterLazyLoad) {
        components[i] = await components[i].load();
      }
    }

    let layouts = [...wrappers, ...components];
    let diffResult = diffLayout(this.currentComponents, layouts);
    if (diffResult.pos < 0) diffResult.pos = 0;
    while (this.injectors.length < layouts.length) {
      this.injectors.push(new RumiousDymanicInjector());
    }

    this.currentComponents = layouts;
    const injectComponent = (index) => {
      if (index >= layouts.length) return null;
      const injector = this.injectors[index];
      injector.commit([{
        type: 'component',
        value: layouts[index],
        props: {
          router: this,
          routeSlot: injectComponent(index + 1)
        }
      }]);
      return injector;
    };

    injectComponent(diffResult.pos);
    this.injectors[diffResult.pos].inject(true);
    return {};
  }

  redirect(path = "/", replace = false) {
    this.strategy.redirect(path, replace);
  }

  start() {
    if (this.strategy && typeof this.strategy.start === 'function') {
      this.strategy.start();
    }
  }
}