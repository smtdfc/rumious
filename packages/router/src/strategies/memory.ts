import { BaseStrategy } from './base.js';
import type { RouterModule } from '../module/index.js';

export class MemoryStrategy extends BaseStrategy {
  private currentPath = '/';

  constructor(public router: RouterModule) {
    super(router);
  }

  resolve(path: string) {
    this.currentPath = path;
    this.router.resolvePage(path);
  }

  redirect(path: string, replace: boolean = false) {
    if (!path.startsWith('/')) {
      path = '/' + path;
    }

    this.resolve(path);
  }

  start() {
    this.resolve(this.currentPath);
  }
}