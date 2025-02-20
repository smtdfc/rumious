/**
 * A class that provides a reference to a DOM element, enabling manipulation,
 * event handling, and child element management.
 *  @module rumious
 */
export class RumiousElementRef {
  /**
   * Creates an instance of RumiousElementRef with the given DOM element.
   * @constructor
   * @param {HTMLElement} element - The DOM element to be referenced.
   */
  constructor(element) {
    this.target = element;
  }
  
  /**
   * Sets the inner HTML of the referenced DOM element.
   * 
   * @param {string} h - The HTML string to set as the innerHTML of the target element.
   */
  set html(h) {
    this.target.innerHTML = h;
  }
  
  /**
   * Queries the DOM element for matching elements based on the given selector.
   * 
   * @param {string} q - The CSS selector to match child elements.
   * @returns {NodeList} A list of matching elements.
   */
  query(q) {
    return this.target.querySelectorAll(q);
  }
  
  /**
   * Sets the text content of the referenced DOM element.
   * 
   * @param {string} h - The text content to set for the target element.
   */
  set text(h) {
    this.target.textContent = h;
  }
  
  /**
   * Attaches an event listener to the referenced DOM element.
   * 
   * @param {string} name - The name of the event to listen for.
   * @param {Function} callback - The function to call when the event is triggered.
   */
  on(name, callback) {
    this.target.addEventListener(name, callback);
  }
  
  /**
   * Removes an event listener from the referenced DOM element.
   * 
   * @param {string} name - The name of the event to stop listening for.
   * @param {Function} callback - The function to remove as the event listener.
   */
  off(name, callback) {
    this.target.removeEventListener(name, callback);
  }
  
  /**
   * Removes the referenced DOM element from the DOM.
   */
  remove() {
    this.target.remove();
  }
  
  /**
   * Appends a new child element to the referenced DOM element.
   * 
   * @param {HTMLElement} element - The DOM element to append as a child.
   */
  addChild(element) {
    this.target.appendChild(element);
  }
  
  /**
   * Updates the target of the reference to the provided DOM element.
   * 
   * @param {HTMLElement} element - The new DOM element to reference.
   */
  set(element) {
    this.target = element;
  }
}

/**
 * Creates and returns a new RumiousElementRef instance for the specified DOM element.
 * @module rumious
 * @param {HTMLElement} element - The DOM element for which a reference will be created.
 * @returns {RumiousElementRef} A new instance of RumiousElementRef for the element.
 */
export function createElementRef(element) {
  return new RumiousElementRef(element);
}