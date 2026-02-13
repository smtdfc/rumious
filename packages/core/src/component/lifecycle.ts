import { Effect, type EffectFunction } from "../state";

export class ComponentLifecycle {
  effects: Effect[] = [];

  effect(cb: EffectFunction, deps: any = []) {
    const eff = new Effect(cb, deps);
    this.effects.push(eff);
  }

  destroy() {
    for (const eff of this.effects) {
      eff.dispose();
    }
    this.effects = [];
  }
}
