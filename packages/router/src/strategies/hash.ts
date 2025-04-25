import type { RumiousRouterModule } from "../router.js";

export class RumiousRouterHashStrategy {
  constructor(public router: RumiousRouterModule) {
    
  }
  
  onHashChange(event: HashChangeEvent) {
    const path = new URL(event.newURL).hash.slice(2);
    console.log(path);
    this.router.resolve(path);
  }
  
  
  start() {
    window.addEventListener("hashchange", this.onHashChange.bind(this));
  }
}