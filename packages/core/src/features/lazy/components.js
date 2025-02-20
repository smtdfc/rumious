import { RumiousComponent } from '../../component/component.js';
import { createElement } from '../../jsx/index.js';

/**
 * Represents a component that handles lazy loading and error handling for asynchronous operations.
 * Displays a fallback component while waiting for the loader to complete, then renders the result or error.
 * @module rumious
 * @extends RumiousComponent
 */
export class Pending extends RumiousComponent {
  /**
   * The tag name used to register the custom element.
   * 
   * @static
   * @type {string}
   */
  static tag = 'r-pending';

  /**
   * Creates an instance of the Pending component.
   * Sets `asynchronousRender` to true for lazy loading.
   * @constructor
   */
  constructor() {
    super();
    this.asynchronousRender = true;
  }

  /**
   * Sets the loader function to be executed and handles the result or error.
   * 
   * @param {Object} loader - The loader object that should contain an `execute` method for the async operation.
   * @returns {Promise<void>} A promise that resolves when the loader is executed.
   */
  async setLoader(loader) {
    this.loader = loader;

    try {
      this.result = await this.loader.execute();
      this.renderResult();
    } catch (error) {
      this.error = error;
      this.renderError();
    }
  }

  /**
   * Renders the result of the async operation when the loader completes successfully.
   * 
   * @throws {Error} Throws an error if the result is not found after lazy loading.
   */
  renderResult() {
    if (!this.result) throw 'Rumious Render: Cannot find component when lazy loading!';
    this.element.before(
      this.render(
        createElement(this.result, {})
      )
    );
    this.element.remove();
  }

  /**
   * Renders the error component or message when the loader fails.
   */
  renderError() {
    this.element.appendChild(
      this.render(
        this.props.errorComponent ?? this.error
      )
    );
  }

  /**
   * Triggered when the component is rendered. It calls the `setLoader` method to begin the async loading.
   */
  onRender() {
    let { loader } = this.props;
    this.setLoader(loader);
  }

  /**
   * Returns the fallback component to be displayed during the loading phase.
   * 
   * @returns {Object} The JSX for the fallback component.
   */
  template() {
    return this.props.fallback;
  }
}