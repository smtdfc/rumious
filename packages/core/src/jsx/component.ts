import { RumiousRenderContext } from '../render/index.js';
import { createComponentElement } from '../component/index.js';
import { RumiousComponentConstructor } from '../types/index.js';

export function createComponent<T>(
  context: RumiousRenderContext,
  parent:HTMLElement,
  component: RumiousComponentConstructor<T>,
  props:T
): HTMLElement {
  let element = createComponentElement(
    context,
    component,
    props
  );
  
  parent.appendChild(element);
  return element;
}