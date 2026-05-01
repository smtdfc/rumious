import { flushQueue } from "../effect/index.js";
import {
  Context,
  TARGET_SYMBOL,
  type Target,
  withCurrentContext,
} from "../runtime/context.js";
import type { Renderer } from "../runtime/renderer.js";

export class App implements Target {
  private ctx = new Context();

  constructor(public root: HTMLElement) {}
  [TARGET_SYMBOL]: () => Context = () => this.ctx;

  attach(renderer: Renderer) {
    this.ctx.clean();

    withCurrentContext(this.ctx, () => {
      const frag = renderer.render(this.ctx);
      this.root.appendChild(frag);

      const defs = this.ctx.deferrers;
      const len = defs.length;
      for (let i = 0; i < len; i++) {
        defs[i]?.();
      }

      this.ctx.deferrers = [];
    });

    flushQueue();
  }

  destroy() {
    this.root.innerHTML = "";
    this.ctx.clean();
  }
}
export function createApp(root: HTMLElement) {
  return new App(root);
}
