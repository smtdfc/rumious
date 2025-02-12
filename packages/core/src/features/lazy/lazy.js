export class RumiousLazyLoader {
  constructor(callback, options = {}) {
    this.hasExecuted = false;
    this.result = null;
    this.callback = callback;
    this.dependents = [];
    this.options = options;
  }

  onLoad(callback) {
    if (this.hasExecuted) {
      callback(this.result);
    } else {
      this.dependents.push(callback);
    }
  }

  execute() {
    return new Promise((resolve, reject) => {
      if (this.hasExecuted) return resolve(this.result);
      this.hasExecuted = true;

      const runCallback = async () => {
        try {
          this.result = await this.callback();
          resolve(this.result);
          this.dependents.forEach(dep => dep(this.result));
        } catch (error) {
          reject(error);
        }
      };

      if (this.options.idle && 'requestIdleCallback' in window) {
        requestIdleCallback(runCallback);
      } else {
        runCallback();
      }
    });
  }
}

const lazyLoadCache = new Map();

export function lazyLoad(callback, options = {}) {
  const key = options.key || callback.toString();
  if (!lazyLoadCache.has(key)) {
    lazyLoadCache.set(key, new RumiousLazyLoader(callback, options));
  }
  return lazyLoadCache.get(key);
}