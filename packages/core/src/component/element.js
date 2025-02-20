/**
 * Represents a custom element that wraps around a Rumious component.
 * This class extends the native HTMLElement and manages the lifecycle of the component instance.
 * @module rumious
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
    if (this.instance.asynchronousRender) {
      (async () => {
        this.instance.onCreate();
        this.instance.requestRender();
      })();
    } else {
      this.instance.onCreate();
      this.instance.requestRender();
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
 * @module rumious
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