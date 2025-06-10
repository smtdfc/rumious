import { RumiousRenderContext } from './context.js';
import { RumiousTemplate } from '../types/index.js';

export function render(
  content: RumiousTemplate,
  container:HTMLElement,
  context:RumiousRenderContext
):HTMLElement{
  return content(container,context);
}