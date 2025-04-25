import type { RumiousRouterModule } from '../router.js';

export class RumiousRouterHistoryStrategy {
  constructor(public router: RumiousRouterModule) {
    this.onPopState = this.onPopState.bind(this);
  }

  onPopState(event: PopStateEvent) {
    const path = window.location.pathname.slice(1);
    this.router.resolve(path);
  }

  redirect(path: string, replace: boolean = false): void {
    const normalizedPath = `/${path.replace(/^\/+/, '')}`;

    if (replace) {
      window.history.replaceState(null, '', normalizedPath);
      this.router.resolve(path);
    } else {
      window.history.pushState(null, '', normalizedPath);
    }
  }

  start(): void {
    window.addEventListener('popstate', this.onPopState);
    const path = window.location.pathname.slice(1);
    this.router.resolve(path);
  }
}
