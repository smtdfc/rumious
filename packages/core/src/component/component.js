import { RumiousRenderContext } from '../render/context.js';

/**
 * Represents a Rumious component that can be rendered with dynamic content.
 * Manages element properties, rendering logic, and lifecycle hooks for components.
 */
export class RumiousComponent {
  /**
   * Creates an instance of RumiousComponent.
   * Initializes component properties and render context.
   * @constructor
   */
  constructor() {
    this.asynchronousRender = false;
    this.element = null;
    this.app = null;
    this.props = {};
    this.forwardRefs = {};
    this.renderContext = new RumiousRenderContext(this);
    this.renderer = null;
    this.wrapped = null;
  }

  /**
   * Prepares the component for rendering with given element, props, and renderer.
   * 
   * @param {HTMLElement} element - The DOM element for the component.
   * @param {Object} props - The properties passed to the component.
   * @param {Object} [wrapped={}] - The wrapped component or children.
   * @param {Function} [renderer=null] - The function used to render the template.
   */
  prepare(element, props, wrapped = {}, renderer = null) {
    this.element = element;
    this.props = props;
    this.renderer = renderer;
    this.wrapped = wrapped;
    this.renderContext.app = this.app;
  }

  /**
   * Returns the template for the component.
   * 
   * @returns {Object} The template data for the component.
   */
  template() {
    return {};
  }

  /**
   * Renders the component using the provided template and renderer function.
   * 
   * @param {Object} template - The template data to be rendered.
   * @returns {DocumentFragment} The rendered HTML fragment.
   */
  render(template) {
    return this.renderer(template, document.createDocumentFragment(), this.renderContext);
  }

  /**
   * Requests a render update by generating and appending a new fragment to the element.
   */
  requestRender() {
    let template = this.template();
    let fragment = this.renderer(template, document.createDocumentFragment(), this.renderContext);
    this.element.appendChild(fragment);
    this.onRender();
  }

  /**
   * Asynchronously cleans up the component by replacing and removing child elements.
   * This can be useful for cleaning up before re-rendering or destroying the component.
   */
  async requestCleanUp() {
    if (this.element) {
      let cloned = this.element.cloneNode(true);
      this.element.replaceWith(cloned);
      this.element = cloned;

      while (this.element.firstChild) {
        this.element.removeChild(this.element.firstChild);
      }
    }
  }

  /**
   * Lifecycle hook for initialization.
   */
  onInit() {}

  /**
   * Lifecycle hook for component creation.
   */
  onCreate() {}

  /**
   * Lifecycle hook for after rendering.
   */
  onRender() {}

  /**
   * Lifecycle hook for updates to the component.
   */
  onUpdate() {}

  /**
   * Lifecycle hook for component destruction.
   */
  onDestroy() {}
}

/**
 * Determines if the given object is an instance of RumiousComponent.
 * 
 * @param {Object} component - The object to check.
 * @returns {boolean} True if the object is a RumiousComponent, false otherwise.
 */
export function isComponent(component) {
  return Object.getPrototypeOf(component) === RumiousComponent;
}