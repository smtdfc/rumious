/**
 * Creates and registers a new directive with the given type, name, and value.
 * 
 * @param {string} type - The type of the directive (e.g., 'attribute', 'event', etc.).
 * @param {string} name - The name of the directive.
 * @param {any} value - The value to associate with the directive.
 * @returns {Function} A function that registers the directive.
 */
export function createDirective(type, name, value) {
  return registerDirective(type, name, value);
}

/**
 * Creates an element or component, depending on the provided type.
 * 
 * If the type is a component, it creates a component element.
 * If the type is a fragment, it creates a fragment element.
 * Otherwise, it creates a standard DOM element.
 * 
 * @param {string|Function} type - The type of element to create (e.g., 'div', 'span', or a component constructor).
 * @param {Object} props - The properties to assign to the element.
 * @param {...any} children - The children of the element (can be other elements, text, or components).
 * @returns {RumiousElement} The created element.
 */
export function createElement(type, props, ...children) {
  if (isComponent(type)) {
    return createComponent(type, props, children);
  }

  if (type === createFragment) {
    return createFragment(...children);
  }

  return new RumiousElement(type, props || {}, normalizeChildren(children));
}

/**
 * Creates a text element with the specified text content.
 * 
 * @param {string} text - The text content of the text element.
 * @returns {RumiousElement} The created text element.
 */
export function createTextElement(text) {
  return new RumiousElement('TEXT_ELEMENT', { nodeValue: text }, []);
}

/**
 * Creates a component element with the specified component type, properties, and children.
 * 
 * @param {Function} type - The component constructor.
 * @param {Object} props - The properties to assign to the component.
 * @param {Array} children - The children elements to assign to the component.
 * @returns {RumiousElement} The created component element.
 */
export function createComponent(type, props, children) {
  let component = new RumiousElement('COMPONENT', { ...props }, new RumiousElementList(normalizeChildren(children)));
  component.component = type;
  return component;
}

/**
 * Creates a fragment element with the specified children.
 * 
 * @param {...any} children - The children elements to assign to the fragment.
 * @returns {RumiousElement} The created fragment element.
 */
function createFragment(...children) {
  return new RumiousElement('FRAGMENT', {}, normalizeChildren(children));
}

/**
 * Normalizes the children of an element, ensuring that each child is either a text element or another element.
 * @ignore
 * @param {Array} children - The children elements to normalize.
 * @returns {Array} An array of normalized children.
 */
function normalizeChildren(children) {
  return children.map(child => (typeof child === 'object' ? child : createTextElement(child)));
}

// Exposing the functions to be used globally with JSX-like syntax
window.RUMIOUS_JSX_SUPPORT = {
  createElement,
  createFragment,
  createDirective
};