import { createComponentElement } from './element.js';

export function renderComponent(componentConstructor, props, wrapped, renderer,parentContext = null) {
  const componentElement = createComponentElement(componentConstructor.tag ?? 'r-component');
  componentElement.init(componentConstructor, props,wrapped, renderer,parentContext?.app);
  return componentElement;
}
