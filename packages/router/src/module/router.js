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
  }
  
  static init(app, options) {
    return new RumiousRouterModule(app, options);
  }
  
  get rootInjector() {
    return this.injectors[0];
  }
  
  resolve(url = new URL('/', window.location.origin)) {
    const segments = url.pathname.split('/').slice(1);
    let params = {};
    let matchedComponents = [];
    let currentRoutes = this.routes;
    let matchedPaths = [];
    
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
      
      currentRoutes = matchedRoute.routes ?? [];
    }
    
    return { type: 'route', paths: matchedPaths, components: matchedComponents, params };
  }
  
  async render(routeData) {
    if (routeData.type === 'error') return;
    
    const { components, paths } = routeData;
    let changeIndex = this.currentPaths.findIndex((path, i) => path !== paths[i]);
    if (changeIndex === -1) changeIndex = this.currentPaths.length;
    
    this.currentPaths = paths;
    
    for (var i = 0; i < components.length; i++) {
      if (typeof components[i] === 'function') {
        components[i] = await components[i]();
      }
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
    this.injectors[changeIndex]?.inject(true);
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