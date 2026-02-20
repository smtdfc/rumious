import type { BaseComponentElement } from "../runtime";
import { Effect, type EffectFunction, type CleanupFunction } from "../state";

export class ComponentLifecycle {
  effects: Effect[] = [];
  cleanups: CleanupFunction[] = [];

  self!: BaseComponentElement;
  effect(cb: EffectFunction, deps: any = []) {
    const eff = new Effect(cb, deps);
    this.effects.push(eff);
  }

  cleanup(cb: CleanupFunction) {
    this.cleanups.push(cb);
  }

  destroy() {
    for (const eff of this.effects) {
      eff.dispose();
    }
    this.effects = [];

    for (const cleanup of this.cleanups) {
      cleanup();
    }
    this.cleanups = [];
  }
}
