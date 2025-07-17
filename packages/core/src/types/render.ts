import type { RenderContext } from '../render/index.js';

export type RenderContent = (context: RenderContext) => DocumentFragment;
