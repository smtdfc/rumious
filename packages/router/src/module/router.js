import { createContext, RumiousDymanicInjector } from 'rumious';

export class RumiousRouterModule {
  constructor(app, options = {}) {
    this.app = app;
    this.routes = options.routes ?? [];
    this.strategy = new options.strategy(this);
    this.context = createContext(`router_${Date.now()}`, {});
    this.injectors = [new RumiousDymanicInjector()];
    this.currentPaths = [];
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
    this.events[name].push(callback)
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
    const segments = url.pathname.split('/').slice(1);
    let params = {};
    let matchedComponents = [];
    let currentRoutes = this.routes;
    let matchedPaths = [];
    let configs = [];
    for (const segment of segments) {
      let matchedRoute = currentRoutes.find(route =>
        route.path === segment || route.path === '*' || route.path.startsWith(':')
      );
      
      if (!matchedRoute) return { type: 'error', name: 'not_found' };
      
      if (matchedRoute.path.startsWith(':')) {
        params[matchedRoute.path.slice(1)] = segment;
      }
      
      matchedPaths.push(matchedRoute.path);
      matchedComponents.push(matchedRoute.component);
      
      if (matchedRoute.exact && matchedPaths.length < segments.length) {
        return { type: 'error', name: 'not_found' };
      }
      
      configs.push({
        protect: matchedRoute.protect,
        redirect: matchedRoute.redirect,
        callback: matchedRoute.callback,
        loader: matchedRoute.loader,
      });
      
      currentRoutes = matchedRoute.routes ?? [];
    }
    
    return { type: 'route', paths: matchedPaths, components: matchedComponents, params, configs };
  }
  
  async render(routeData) {
    if (routeData.type === 'error') return;
    
    const { components, paths, configs } = routeData;
    let changeIndex = this.currentPaths.findIndex((path, i) => path !== paths[i]);
    if (changeIndex === -1) changeIndex = this.currentPaths.length;
    
    this.currentPaths = paths;
    
    for (const { protect, redirect } of configs) {
      if (typeof protect === 'function' && !(await protect())) {
        this.shouldReinject = true;
        return { type: "error", name: "not_allowed" };
      }
      
      if (redirect) {
        this.redirect(typeof redirect === 'function' ? redirect() : redirect);
      }
    }
    
    if (this.shouldReinject) {
      this.shouldReinject = false;
      changeIndex = 0;
    }
    
    for (var i = changeIndex; i < components.length; i++) {
      if (configs[i].loader) components[i] = await configs[i].loader({ router: this })
    }
    
    while (this.injectors.length < components.length) {
      this.injectors.push(new RumiousDymanicInjector());
    }
    
    const injectComponent = (index) => {
      if (index >= components.length) return null;
      const injector = this.injectors[index];
      injector.commit([{
        type: 'component',
        value: components[index],
        props: {
          router: this,
          routeSlot: injectComponent(index + 1)
        }
      }]);
      
      return injector;
    };


    injectComponent(changeIndex);
    
    this.injectors[changeIndex].inject(true);
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