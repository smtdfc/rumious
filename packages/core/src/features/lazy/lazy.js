/**
 * Represents a lazy loader that defers the execution of a callback until it is requested.
 * Once the callback is executed, its result is cached and subsequent requests will immediately return the result.
 * @module rumious
 */
export class RumiousLazyLoader {
  /**
   * Creates an instance of RumiousLazyLoader.
   * 
   * @param {Function} callback - The function that will be lazily loaded and executed.
   * @param {Object} [options={}] - Options to configure the lazy loader.
   */
  constructor(callback, options = {}) {
    this.hasExecuted = false;
    this.result = null;
    this.callback = callback;
    this.dependents = [];
    this.options = options;
  }

  /**
   * Registers a callback that will be invoked when the lazy loader has executed and returned its result.
   * 
   * @param {Function} callback - The callback to be invoked when the result is available.
   */
  onLoad(callback) {
    if (this.hasExecuted) {
      callback(this.result);
    } else {
      this.dependents.push(callback);
    }
  }

  /**
   * Executes the callback function lazily and resolves with its result.
   * If the callback has already been executed, it immediately resolves with the cached result.
   * 
   * @returns {Promise} A promise that resolves with the result of the callback function.
   */
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
/**
 * A utility function to create or retrieve a cached instance of RumiousLazyLoader.
 * @module rumious
 * @param {Function} callback - The function that will be lazily loaded and executed.
 * @param {Object} [options={}] - Options to configure the lazy loader.
 * @returns {RumiousLazyLoader} The lazy loader instance.
 */
export function lazyLoad(callback, options = {}) {
  const key = options.key || callback.toString();
  if (!lazyLoadCache.has(key)) {
    lazyLoadCache.set(key, new RumiousLazyLoader(callback, options));
  }
  return lazyLoadCache.get(key);
}