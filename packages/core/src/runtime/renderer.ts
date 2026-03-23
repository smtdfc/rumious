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

export function $$createRoot(template: HTMLTemplateElement): Node {
  return template.content.cloneNode(true);
}

export function $$walk(root: Node, path: string) {
  let current = root;
  const len = path.length;

  for (let i = 0; i < len; i++) {
    current =
      path.charCodeAt(i) === 102 ? current.firstChild! : current.nextSibling!;
  }

  return current;
}
