import { RumiousRenderContext } from '../render/context.js';
import { render } from '../render/index.js';

/**
 * @typedef {Object} RumiousModule
 * @property {(app: RumiousApp, configs?: Object) => any} init
 */

/**
 * @template [T=any]
 */
export class RumiousApp {
  /**
   * Creates an instance of RumiousApp.
   * @param {HTMLElement} [root=document.createElement('span')] - Root element to render into.
   * @param {Object} [configs={}] - App-level configuration options.
   */
  constructor(root = document.createElement('span'), configs = {}) {
    /** @type {HTMLElement} */
    this.root = root;
    
    /** @type {RumiousApp} */
    this.app = this;
    
    /** @type {any[]} */
    this.modules = [];
    
    /** @type {Object} */
    this.configs = configs;
    
    /** @type {RumiousRenderContext} */
    this.renderContext = new RumiousRenderContext(this);
  }
  
  /**
   * Renders an element into the app's root container.
   * @param {HTMLElement} element - Element to render.
   */
  render(element) {
    this.renderContext.runHooks('onBeforeRender', this.renderContext);
    render(element, this.root, this.renderContext);
    this.renderContext.runHooks('onRendered', this.renderContext);
  }
  
  /**
   * Registers a module to the application.
   *
   * @template T
   * @param {{ init(app: RumiousApp, configs?: Object): T }} module - Module with an `init()` method.
   * @param {Object} [configs={}] - Module-specific configuration.
   * @returns {T} - Instance returned by the module's `init()` method.
   */
  addModule(module, configs = {}) {
    const moduleInstance = module.init(this, configs);
    return moduleInstance;
  }
}