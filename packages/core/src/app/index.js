/**
 * Represents the Rumious Application.
 * Manages the lifecycle of the application, including rendering and context hooks.
 * 
 */
export class RumiousApp {
  /**
   * Creates an instance of the RumiousApp.
   * @constructor
   * @param {HTMLElement} [root=document.createElement('span')] - The root element where the app will be rendered.
   * @param {Object} [configs={}] - Configuration options for the app.
   */
  constructor(root = document.createElement('span'), configs = {}) {
    this.root = root;
    this.app = this;
    this.configs = configs;
    this.renderContext = new RumiousRenderContext(this);
  }

  /**
   * Renders the provided element to the root of the app.
   * This method triggers lifecycle hooks before and after rendering.
   * 
   * @param {HTMLElement} element - The element to be rendered in the app.
   */
  render(element) {
    this.renderContext.runHooks('onBeforeRender', this.renderContext);
    render(element, this.root, this.renderContext);
    this.renderContext.runHooks('onRendered', this.renderContext);
  }
  
  /**
   * Add module for app
   * 
   * @param {RumiousModule} module - The module .
   */
  addModule(module) {
   }

}