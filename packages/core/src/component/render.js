import { createComponentElement } from './element.js';

/**
 * Renders a component by creating an instance of a custom element and initializing it with the given properties and renderer.
 * @ignore
 * @param {Function} componentConstructor - The constructor of the component to render.
 * @param {Object} props - The properties passed to the component.
 * @param {Object} wrapped - The wrapped component or children to be passed to the component.
 * @param {Function} renderer - The function used to render the component.
 * @param {Object} [parentContext=null] - The context of the parent app, which can provide additional information like `app`.
 * @returns {HTMLElement} The created custom element with the rendered component.
 */
export function renderComponent(componentConstructor, props, wrapped, renderer, parentContext = null) {
  const componentElement = createComponentElement(componentConstructor.tag ?? 'r-component');
  componentElement.init(componentConstructor, props, wrapped, renderer, parentContext?.app);
  return componentElement;
}