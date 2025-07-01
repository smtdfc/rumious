import { RumiousRenderContext } from '../render/index.js';
import { createComponentElement } from '../component/index.js';
import { RumiousComponentConstructor } from '../types/index.js';

export function createComponent<T>(
  root:HTMLElement,
  context: RumiousRenderContext,
  component: RumiousComponentConstructor<T>,
  props:T
): [HTMLElement] {
  let [element] = createComponentElement(
    context,
    component,
    props
  );
  root.appendChild(element);
  return [element];
}