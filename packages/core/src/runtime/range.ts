import { Context } from "./context";
import { flushQueue } from "../effect/index.js";
import { Renderer } from "./renderer";

export const RANGE_CACHE = new WeakMap<RenderRange, Context>();

export class RenderRange {
  constructor(
    public start: Comment,
    public end: Comment,
  ) {}
}
export function $$createRange(root: Node): RenderRange {
  const start = new Comment("r:s");
  const end = new Comment("r:e");

  const parent = root.parentNode;
  if (parent) {
    parent.insertBefore(start, root);
    parent.insertBefore(end, root.nextSibling);
    parent.removeChild(root);
  }

  return new RenderRange(start, end);
}

export function $$insertInRange(
  range: RenderRange,
  content: any,
  parentCtx: Context,
) {
  const { start, end } = range;
  const parent = start.parentNode;

  if (!parent) return;

  const oldContent = RANGE_CACHE.get(range);
  if (oldContent) {
    oldContent.clean();
    RANGE_CACHE.delete(range);
  }

  let next = start.nextSibling;
  while (next && next !== end) {
    const toRemove = next;
    next = next.nextSibling;
    parent.removeChild(toRemove);
  }

  if (content instanceof Node) {
    parent.insertBefore(content, end);
  } else if (typeof content === "string" || typeof content === "number") {
    const textNode = document.createTextNode(String(content));
    parent.insertBefore(textNode, end);
  } else if (content instanceof Renderer) {
    let ctx = new Context(parentCtx);
    RANGE_CACHE.set(range, ctx);
    let frag = content.render(ctx);
    parent.insertBefore(frag, end);

    const defs = ctx.deferrers;
    for (let i = 0; i < defs.length; i++) {
      defs[i]?.();
    }

    ctx.deferrers = [];
    flushQueue();
  }
}
