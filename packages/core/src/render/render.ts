import type { RenderContext } from './context.js';
import type { RenderContent } from '../types/index.js';

export function isRenderContent(val: unknown): val is RenderContent {
  return typeof val === 'function' && val.length === 1;
}

export function renderFrag(
  context: RenderContext,
  content: RenderContent,
): DocumentFragment {
  context.onRenderFinish = [];
  const fragment = content(context);
  for (let i = 0; i < context.onRenderFinish.length; i++) {
    context.onRenderFinish[i]();
  }
  return fragment;
}


export function render(
  target: HTMLElement,
  context: RenderContext,
  content: RenderContent,
): DocumentFragment {
  context.onRenderFinish = [];
  const fragment = content(context);
  target.appendChild(fragment);
  for (let i = 0; i < context.onRenderFinish.length; i++) {
    context.onRenderFinish[i]();
  }
  return fragment;
}