import type { Context } from "./context";

export type RendererFn = (ctx: Context) => DocumentFragment;

export class Renderer {
  constructor(public fn: RendererFn) {}

  render(ctx: Context) {
    return this.fn(ctx);
  }
}

export function $$createRenderer(fn: RendererFn): Renderer {
  return new Renderer(fn);
}
