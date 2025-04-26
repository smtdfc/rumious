import type { RumiousRouterModule } from '../router.js';

export class RumiousRouterHashStrategy {
  constructor(public router: RumiousRouterModule) {}

  onHashChange(event: HashChangeEvent) {
    const path = new URL(event.newURL).hash.slice(1);
    this.router.resolve(path);
  }

  redirect(path: string, replace: boolean = false): void {
    const newHash = `#/${path.replace(/^\/+/, '')}`;

    if (replace) {
      const url = new URL(window.location.href);
      url.hash = newHash;
      window.history.replaceState(null, '', url.toString());
      this.router.resolve(path);
    } else {
      window.location.hash = newHash;
    }
  }

  start() {
    window.addEventListener('hashchange', this.onHashChange.bind(this));
    let path = new URL(window.location.href).hash.slice(1);
    if (path === '') path = '/';
    this.router.resolve(path);
  }
}
