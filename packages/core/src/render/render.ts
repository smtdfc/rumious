import { RumiousRenderContext } from './context.js';
import { RumiousTemplate } from '../types/index.js';

export function render(
  content: RumiousTemplate,
  container:HTMLElement,
  context:RumiousRenderContext
):HTMLElement{
  context.onRendered = [];
  let result = content(container,context);
  
  for (var i = 0; i < context.onRendered.length; i++) {
    context.onRendered[i]();
  }
  return result;
}