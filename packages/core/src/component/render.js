import { createComponentElement } from './element.js';

export function renderComponent(componentConstructor, props, renderer) {
  const componentElement = createComponentElement();
  componentElement.init(componentConstructor, props, renderer);
  return componentElement;
}
