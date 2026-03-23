import type { EffectFunc } from "../effect/index.js";
import { Context } from "../runtime/context.js";
import { $$effect } from "../runtime/effect.js";
import type { State } from "../state/state.js";

export interface ComponentContext {
  clean();
}

export class Component {
  public ctx: Context;

  constructor(parent: Context) {
    this.ctx = new Context(parent);

    if (parent) {
      parent.childrens.push(this);
    }
  }

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
