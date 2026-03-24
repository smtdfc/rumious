import type { EffectFunc } from "../effect/index.js";
import { Context, TARGET_SYMBOL, type Target } from "../runtime/context.js";
import { $$effect } from "../runtime/effect.js";
import type { State } from "../state/state.js";

export class Component implements Target {
  private ctx: Context;

  constructor(parent: Context) {
    this.ctx = new Context(parent);

    if (parent) {
      parent.childrens.push(this);
    }
  }

  [TARGET_SYMBOL]: () => Context = () => this.ctx;

  clean() {
    this.ctx.clean();
  }

  effect(fn: EffectFunc, deps: State<any>[]) {
    $$effect(fn, deps, this.ctx);
  }

  cleanup(fn: () => void) {
    this.ctx.cleanups.push(fn);
  }
}
