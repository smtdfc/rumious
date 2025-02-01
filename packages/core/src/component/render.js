import { createComponentElement } from './element.js';

export function renderComponent(componentConstructor, props, wrapped, renderer) {
  const componentElement = createComponentElement();
  componentElement.init(componentConstructor, props,wrapped, renderer);
  return componentElement;
}
