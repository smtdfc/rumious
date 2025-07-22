import { BaseStrategy } from './base.js';
import type { RouterModule } from '../module/index.js';

export class HashStrategy extends BaseStrategy {
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

    const hash = '#' + path;

    if (replace) {
      location.replace(location.origin + location.pathname + hash);
    } else {
      location.hash = path;
    }
  }

  start() {
    const onHashChange = () => {
      const hash = window.location.hash;
      let path = hash.slice(1);
      if (path.length === 0) path = '/';
      this.resolve(path);
    };

    window.addEventListener('hashchange', onHashChange);
    onHashChange();
  }
}
