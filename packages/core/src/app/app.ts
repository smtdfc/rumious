import { flushQueue } from "../effect/index.js";
import { Context } from "../runtime/context.js";
import type { Renderer } from "../runtime/renderer.js";

export class App {
  private context = new Context();

  constructor(public root: HTMLElement) {}

  attach(renderer: Renderer) {
    this.context.clean();

    const frag = renderer.render(this.context);
    this.root.appendChild(frag);

    const defs = this.context.deferrers;
    const len = defs.length;
    for (let i = 0; i < len; i++) {
      defs[i]?.();
    }

    this.context.deferrers = [];
    flushQueue();
  }
}
export function createApp(root: HTMLElement) {
  return new App(root);
}
