class HashStrategy {
  constructor(router) {
    this.router = router;
    this.lastPath = null;
  }

  redirect(path, replace = false) {
    if (!path.startsWith('/')) path = '/' + path;
    if (replace) {
      window.location.replace(`#${path}`);
    } else {
      window.location.hash = path;
    }
  }

  async resolve(url) {
    if (this.lastPath === url.pathname) return;
    this.lastPath = url.pathname;

    this.router.triggerEvent('change', { router: this, url });

    try {
      let result = this.router.resolve(url);

      if (result.type === 'error') {
        this.router.triggerEvent('error', { router: this, url, error: result });
        return;
      }
      this.router.currentPattern = result.pattern;
      this.router.params = result.params;
      this.router.triggerEvent('solved', { router: this, url, result });

      let renderResult = await this.router.render(result);
      if (renderResult.type === 'error') {
        this.router.triggerEvent('error', {
          router: this,
          url,
          error: renderResult,
        });
      } else {
        this.router.triggerEvent('loaded', { router: this, url, result });
      }
    } catch (error) {
      console.error('Router resolve error:', error);
      this.router.triggerEvent('error', { router: this, url, error });
    }
  }

  start() {
    const getCurrentUrl = () => {
      let currentPath = window.location.hash.slice(1);
      if (!currentPath || currentPath === '') currentPath = '/';
      return new URL(currentPath, window.location.origin);
    };

    window.addEventListener('hashchange', () => {
      this.resolve(getCurrentUrl());
    });

    this.resolve(getCurrentUrl());
  }
}

class HistoryStrategy {
  constructor(router) {
    this.router = router;
    this.lastPath = null;
  }

  redirect(path, replace = false) {
    if (!path.startsWith('/')) path = '/' + path;
    const url = new URL(path, window.location.origin);
    if (replace) {
      window.history.replaceState({}, '', url);
    } else {
      window.history.pushState({}, '', url);
    }
    this.resolve(url);
  }

  async resolve(url) {
    if (this.lastPath === url.pathname) return;
    this.lastPath = url.pathname;

    this.router.triggerEvent('change', { router: this, url });

    try {
      let result = this.router.resolve(url);

      if (result.type === 'error') {
        this.router.triggerEvent('error', { router: this, url, error: result });
        return;
      }

      this.router.currentPattern = result.pattern;
      this.router.params = result.params;
      this.router.triggerEvent('solved', { router: this, url, result });

      let renderResult = await this.router.render(result);
      if (renderResult.type === 'error') {
        this.router.triggerEvent('error', {
          router: this,
          url,
          error: renderResult,
        });
      } else {
        this.router.triggerEvent('loaded', { router: this, url, result });
      }
    } catch (error) {
      console.error('Router resolve error:', error);
      this.router.triggerEvent('error', { router: this, url, error });
    }
  }

  start() {
    const getCurrentUrl = () =>
      new URL(window.location.pathname, window.location.origin);

    window.addEventListener('popstate', () => {
      this.resolve(getCurrentUrl());
    });

    this.resolve(getCurrentUrl());
  }
}

class MemoryStrategy {
  constructor(router) {
    this.router = router;
    this.currentPath = '/';
    this.history = ['/'];
    this.index = 0;
  }

  redirect(path, replace = false) {
    if (!path.startsWith('/')) path = '/' + path;
    if (replace) {
      this.history[this.index] = path;
    } else {
      this.history.push(path);
      this.index++;
    }
    this.currentPath = path;
    this.resolve(new URL(path, window.location.origin));
  }

  async resolve(url) {
    if (this.currentPath === url.pathname) return;
    this.currentPath = url.pathname;

    this.router.triggerEvent('change', { router: this, url });

    try {
      let result = this.router.resolve(url);

      if (result.type === 'error') {
        this.router.triggerEvent('error', { router: this, url, error: result });
        return;
      }

      this.router.currentPattern = result.pattern;
      this.router.params = result.params;
      this.router.triggerEvent('solved', { router: this, url, result });

      let renderResult = await this.router.render(result);
      if (renderResult.type === 'error') {
        this.router.triggerEvent('error', {
          router: this,
          url,
          error: renderResult,
        });
      } else {
        this.router.triggerEvent('loaded', { router: this, url, result });
      }
    } catch (error) {
      console.error('Router resolve error:', error);
      this.router.triggerEvent('error', { router: this, url, error });
    }
  }

  start() {
    this.resolve(new URL(this.currentPath, window.location.origin));
  }
}

export const RumiousRouterStrategies = {
  hash: HashStrategy,
  history: HistoryStrategy,
  memory: MemoryStrategy,
};
