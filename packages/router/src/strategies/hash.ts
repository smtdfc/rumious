import type { RumiousRouterModule } from "../router.js";
import { RumiousRouterRouteMatchResult } from "../types.js";
import { renderComponent } from 'rumious';

export class RumiousRouterHashStrategy {
  constructor(public router: RumiousRouterModule) {
    
  }
  
  async resolve(path: string): Promise < void > {
    let routeMatched!: RumiousRouterRouteMatchResult;
    for (let pattern in this.router.routes) {
      let result = this.router.match(pattern, path);
      if (result.isMatched) routeMatched = result;
    }
    
    if (!routeMatched) return;
    if (routeMatched.configs?.protect && !routeMatched.configs?.protect(this.router)) {
      this.router.event.emit("not_allow", {
        router: this.router,
        path,
      });
      return;
    }
    
    if (routeMatched.configs?.handler) {
      let component = await routeMatched.configs.handler?.(
        this.router,
        routeMatched.slugs as Record < string, string > ,
      );
      
      console.log(renderComponent(component,{
        router:this.router,
        route:routeMatched,
        routeSlot: null 
      }));
    }
  }
  
  onHashChange(event: HashChangeEvent) {
    const path = new URL(event.newURL).hash.slice(2);
    console.log(path);
    this.resolve(path);
  }
  
  
  start() {
    window.addEventListener("hashchange", this.onHashChange.bind(this));
  }
}