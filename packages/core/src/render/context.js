/**
 * Represents the rendering context for a Rumious component.
 * Provides access to the component, its hooks, and helper methods.
 *  
 */
export class RumiousRenderContext {
  /**
   * Creates a new instance of RumiousRenderContext.
   * @constructor
   * @param {Object} target - The component instance associated with this context.
   */
  constructor(target) {
    this.target = target;
    this.app = target.app;
    this.cleans = [];
    this.hooks = {
      onRendered: [],
      onBeforeRender: []
    };
  }
  
  /**
   * Finds and returns a property or method from the component instance.
   *
   * @param {string} name - The name of the property or method to retrieve.
   * @returns {*} The value of the specified property or method.
   */
  find(name) {
    return this.target[name];
  }
  
  /**
   * Retrieves a property or method from the component instance (alias of `find`).
   *
   * @param {string} name - The name of the property or method to retrieve.
   * @returns {*} The value of the specified property or method.
   */
  get(name) {
    return this.target[name];
  }
  
  /**
   * Adds a new hook callback to the specified hook type.
   *
   * @param {string} type - The type of hook (`onRendered` or `onBeforeRender`).
   * @param {Function} callback - The function to execute when the hook runs.
   * @throws {Error} If the hook type is not recognized.
   */
  addHook(type, callback) {
    if (this.hooks[type]) {
      this.hooks[type].push(callback);
    } else {
      throw new Error(`Hook type "${type}" is not defined!`);
    }
  }
  
  /**
   * Executes all registered hooks of the specified type in sequence.
   *
   * @param {string} type - The type of hook to execute (`onRendered` or `onBeforeRender`).
   * @param {...*} args - Additional arguments to pass to the hook functions.
   * @returns {Promise<void>} A promise that resolves when all hooks have executed.
   */
  async runHooks(type, ...args) {
    if (this.hooks[type]) {
      for (const hook of this.hooks[type]) {
        await hook(...args);
      }
    }
  }
}