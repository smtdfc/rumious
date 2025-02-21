/**
 * Represents an element with a type, properties, and children, used in the Rumious .
 * 
 */
export class RumiousElement {
  /**
   * Creates an instance of RumiousElement.
   * @constructor
   * @param {string} type - The type of the element (e.g., 'div', 'span').
   * @param {Object} props - The properties or attributes of the element.
   * @param {Array} [children=[]] - The children elements or content within this element.
   */
  constructor(type, props, children = []) {
    this.type = type;
    this.props = props;
    this.children = children;
  }
}

/**
 * Represents a list of elements in the Rumious .
 * 
 */
export class RumiousElementList {
  /**
   * Creates an instance of RumiousElementList.
   * @constructor
   * @param {Array} list - The list of elements contained within the RumiousElementList.
   */
  constructor(list) {
    this.type = 'ELEMENT_LIST';
    this.children = list;
  }
  
  /**
   * Iterates over each element in the list and applies the given callback function.
   * 
   * @param {Function} callback - The callback function to apply on each element.
   */
  forEach(callback) {
    this.children.forEach(callback);
  }
}