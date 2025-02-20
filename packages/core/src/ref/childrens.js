/**
 * A class that provides a reference to the children of a DOM element, enabling 
 * manipulation and querying of the child elements.
 * @module rumious
 */
export class RumiousChildrensRef {
  /**
   * Creates an instance of RumiousChildrensRef with the given target element.
   * @constructor
   * @param {HTMLElement} element - The DOM element whose children will be referenced and manipulated.
   */
  constructor(element) {
    this.target = element;
  }
  
  /**
   * Queries the children of the target element based on a CSS selector.
   * 
   * @param {string} q - The CSS selector to query the children of the target element.
   * @returns {NodeList} A list of child elements matching the selector.
   */
  query(q) {
    return this.target.querySelectorAll(q);
  }
  
  /**
   * Gets a specific child of the target element by index.
   * 
   * @param {number} idx - The index of the child to retrieve.
   * @returns {HTMLElement} The child element at the specified index.
   */
  index(idx) {
    return Array.from(this.target.children)[idx];
  }
  
  /**
   * Returns an array of all child elements of the target element.
   * 
   * @returns {Array} An array of all child elements.
   */
  list() {
    return Array.from(this.target.children);
  }
  
  /**
   * Gets the parent element of the target element.
   * 
   * @returns {HTMLElement} The parent element of the target.
   */
  get parent() {
    return this.target;
  }
  
  /**
   * Removes the target element from its parent in the DOM.
   */
  remove() {
    this.target.remove();
  }
  
  /**
   * Adds a child element to the target element.
   * 
   * @param {HTMLElement} element - The element to be added as a child.
   */
  addChild(element) {
    this.target.appendChild(element);
  }
  
  /**
   * Updates the target element with a new DOM element.
   * 
   * @param {HTMLElement} element - The new element to set as the target.
   */
  set(element) {
    this.target = element;
  }
}

/**
 * Creates and returns a new RumiousChildrensRef instance for the specified DOM element.
 * @module rumious
 * @param {HTMLElement} element - The DOM element whose children will be referenced.
 * @returns {RumiousChildrensRef} A new instance of RumiousChildrensRef for the element.
 */
export function createChildrensRef(element) {
  return new RumiousChildrensRef(element);
}