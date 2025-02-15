import { createContext } from "rumious";

export class RumiousRouterModule {
  constructor(app, configs = {}) {
    this.app = app;
    this.configs = configs;
    this.routes = configs.routes ?? [];
    this.strategy = configs.strategy;
    this.context = createContext(`router_${Date.now()}`, {});
  }
  
  resolve(url = new URL("/", window.location.origin)) {
    let pathSplited = url.pathname.split("/").filter(Boolean);
    let currentRoutes = this.routes;
    let routeData = {};
    let components = [];
    let depth = 0;
    
    for (let pathSegment of pathSplited) {
      depth++;
      let matchedRoute = null;
      
      for (let route of currentRoutes) {
        if (route.path.startsWith(":")) {
          let paramName = route.path.slice(1);
          routeData[paramName] = pathSegment;
          matchedRoute = route;
          break;
        } else if (route.path === "*" || route.path === pathSegment) {
          matchedRoute = route;
          break;
        }
      }
      
      if (!matchedRoute) return { type: "error", name: "not_found" };
      
      components.push({ component: matchedRoute.component });
      if (matchedRoute.exact && depth < pathSplited.length) {
        return { type: "error", name: "not_found" };
      }
      
      currentRoutes = matchedRoute.routes ?? [];
    }
    
    return { type: "route", components: components, params: routeData };
  }
}