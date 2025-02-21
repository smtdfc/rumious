import { createElement } from '../jsx/index.js';

/**
 * 
 * @typedef {Object} ContentItem
 * @property {'html' | 'text' | 'component'} type - Loại nội dung.
 * @property {*} value - Giá trị của nội dung.
 * @property {object} [props] - Thuộc tính tùy chọn.
 * @property {*} [child] - Nội dung con (nếu có).
 */

/**
 * 
 * @typedef {Object} TargetItem
 * @property {Element} element - Phần tử DOM mục tiêu.
 * @property {*} context - Ngữ cảnh cho renderer.
 * @property {Function} renderer - Hàm dùng để render component.
 */

/**
 * Class representing a dynamic content injector for injecting HTML, text, or components into target elements.
 * 
 */
export class RumiousDymanicInjector {
  constructor() {
    /**
     * List of contents to be injected.
     * @type {Array<ContentItem>}
     */
    this.contents = [];
    
    /**
     * List of target elements where the content will be injected.
     * @type {Array<TargetItem>}
     */
    this.targets = [];
    
    /**
     * WeakMap to store MutationObservers for each target.
     * @type {WeakMap<Element, MutationObserver>}
     */
    this.observers = new WeakMap();
  }
  
  /**
   * Commits new content to be injected.
   * @param {Array<ContentItem>} contents - The content to be stored for injection.
   */
  commit(contents = []) {
    this.contents = contents;
  }
  
  /**
   * Sets a target element to inject content into.
   * @param {Element} target - The target element.
   * @param {Function} renderer - Function used to render components.
   * @param {*} context - Additional context for rendering.
   */
  setTarget(target, renderer, context) {
    this.targets.push({ element: target, context, renderer });
    this.observeTarget(target);
  }
  
  /**
   * Observes a target element to detect if it is removed from the DOM.
   * @param {Element} target - The target element to observe.
   */
  observeTarget(target) {
    if (this.observers.has(target)) return;
    
    const observer = new MutationObserver(() => {
      if (!target.parentNode) {
        this.removeTarget(target);
      }
    });
    
    observer.observe(target, { childList: false, subtree: false });
    
    this.observers.set(target, observer);
  }
  
  /**
   * Removes a target element from the list and disconnects its observer.
   * @param {Element} target - The target element to remove.
   */
  removeTarget(target) {
    const observer = this.observers.get(target);
    if (observer) {
      observer.disconnect();
      this.observers.delete(target);
    }
    this.targets = this.targets.filter(t => t.element !== target);
  }
  
  /**
   * Injects the stored content into all target elements.
   * @param {boolean} [resetTarget=false] - Whether to clear the target's content before injecting.
   */
  inject(resetTarget = false) {
    for (let target of this.targets) {
      if (resetTarget) target.element.textContent = '';
      this.contents.forEach(content => {
        if (content.type === 'html') {
          target.element.innerHTML = content.value;
        } else if (content.type === 'text') {
          target.element.textContent = content.value;
        } else if (content.type === 'component') {
          target.renderer(
            createElement(
              content.value,
              content.props ?? {},
              content.child ?? {}
            ),
            target.element,
            target.context
          );
        }
      });
    }
  }
}

/**
 * Creates an injector with HTML content.
 * 
 * @param {string} html - The HTML string to inject.
 * @returns {RumiousDymanicInjector} - A new injector instance with the HTML content.
 */
export function injectHTML(html) {
  let injector = new RumiousDymanicInjector();
  injector.commit([{ type: 'html', value: html }]);
  return injector;
}

/**
 * Creates an injector with plain text content.
 * 
 * @param {string} text - The text string to inject.
 * @returns {RumiousDymanicInjector} - A new injector instance with the text content.
 */
export function injectText(text) {
  let injector = new RumiousDymanicInjector();
  injector.commit([{ type: 'text', value: text }]);
  return injector;
}