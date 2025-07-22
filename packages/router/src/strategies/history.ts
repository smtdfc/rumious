import { BaseStrategy } from './base.js';
import type { RouterModule } from '../module/index.js';

export class HistoryStrategy extends BaseStrategy {
  constructor(public router: RouterModule) {
    super(router);
  }
  
  resolve(path: string) {
    this.router.resolvePage(path);
  }
  
  redirect(path: string, replace: boolean = false) {
    if (!path.startsWith('/')) {
      path = '/' + path;
    }
    
    const url = location.origin + path;
    
    if (replace) {
      history.replaceState(null, '', url);
    } else {
      history.pushState(null, '', url);
    }
    
    this.resolve(path);
  }
  
  start() {
    const onPopState = () => {
      this.resolve(location.pathname);
    };
    
    window.addEventListener('popstate', onPopState);
    this.resolve(location.pathname);
  }
}