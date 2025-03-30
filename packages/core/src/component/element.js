/**
 * Represents a custom element that wraps around a Rumious component.
 * This class extends the native HTMLElement and manages the lifecycle of the component instance.
 * 
 * @extends HTMLElement
 */
export class RumiousComponentElement extends HTMLElement {
  /**
   * Creates an instance of RumiousComponentElement.
   * Initializes the element and sets up instance and ref properties.
   * @constructor
   */
  constructor() {
    super();
    this.instance = null;
    this.ref = null;
  }
  
  /**
   * Cleans up the custom element by resetting its prototype and removing it from the DOM.
   */
  cleanUp() {
    Object.setPrototypeOf(this, HTMLUnknownElement.prototype);
    this.remove();
  }
  
  /**
   * Initializes the component element with a given component constructor, props, wrapped children, renderer, and app.
   * 
   * @param {Function} componentConstructor - The constructor of the component to be initialized.
   * @param {Object} props - The properties passed to the component.
   * @param {Object} [wrapped={}] - The wrapped component or children.
   * @param {Function} renderer - The function used to render the component.
   * @param {Object} app - The app instance that the component belongs to.
   */
  init(componentConstructor, props, wrapped = {}, renderer, app) {
    this.instance = new componentConstructor();
    this.instance.element = this;
    this.instance.app = app;
    this.instance.prepare(this, props, wrapped, renderer);
    this.instance.onInit();
  }
  
  /**
   * Lifecycle callback called when the element is added to the DOM.
   * Calls the component's `onCreate` and `requestRender` methods.
   */
  connectedCallback() {
    switch (this.instance.renderOptions.mode) {
      case 'linear':
        this.instance.onCreate();
        this.instance.requestRender();
        break;

      case 'async':
        (async ()=>{
          this.instance.onCreate();
          this.instance.requestRender();
        })();
        break;

      case 'animate':
        requestAnimationFrame(async ()=>{
          this.instance.onCreate();
          this.instance.requestRender();
        });
        break;

      case 'idle':
        requestIdleCallback(async ()=>{
          this.instance.onCreate();
          this.instance.requestRender();
        });
        break;
        
      case 'defer':
        setTimeout(async () => {
          this.instance.onCreate();
          this.instance.requestRender();
        },0);
        break;
      
      case 'delay':
        setTimeout(async () => {
          this.instance.onCreate();
          this.instance.requestRender();
        },this.instance.renderOptions.time);
        break;

      case 'visible': {
        const observer = new IntersectionObserver((entries, obs) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              obs.disconnect();
              this.instance.onCreate();
              this.instance.requestRender();
            }
          }
        });

        observer.observe(this);
        break;
      }
    }
  }
  
  /**
   * Lifecycle callback called when the element is removed from the DOM.
   * Calls the component's `onDestroy` and `requestCleanUp` methods, then cleans up the element.
   */
  disconnectedCallback() {
    this.instance.onDestroy();
    this.instance.requestCleanUp();
    this.cleanUp();
  }
}

/**
 * Creates and returns a new custom element of type RumiousComponentElement.
 * If the custom element has not been defined previously, it will be defined with the given name.
 * 
 * @param {string} [name='r-component'] - The name of the custom element.
 * @returns {HTMLElement} A new instance of the custom element.
 */
export function createComponentElement(name = 'r-component') {
  if (!window.customElements.get(name)) {
    window.customElements.define(name, class extends RumiousComponentElement {
      static tag = name;
    });
  }
  
  return document.createElement(name);
}