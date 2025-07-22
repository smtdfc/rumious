import type { RouterModule } from '../module/index.js';

export class BaseStrategy {
  constructor(public router: RouterModule) {}

  start() {}
  redirect(path: string, replace: boolean = false) {
    throw new Error('RumiousRouterError: Method is not implementation !');
  }
}
