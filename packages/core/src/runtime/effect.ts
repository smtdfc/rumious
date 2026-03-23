import { disposeEffect, type EffectFunc } from "../effect/index.js";
import type { State } from "../state/state.js";
import type { Context } from "./context.js";

export function $$effect(fn: EffectFunc, deps: State<any>[], ctx: Context) {
  let lastCleanup: (() => void) | null = null;
  let unsubs: (() => void)[] = [];

  const runEffect = () => {
    if (lastCleanup) {
      lastCleanup();
      lastCleanup = null;
    }

    const result = fn();

    if (typeof result === "function") {
      lastCleanup = result;
    }
  };

  ctx.deferrers.push(() => {
    for (let i = 0; i < deps.length; i++) {
      const unsub = deps[i]?.subscribe(runEffect)!;
      unsubs.push(unsub);
    }
    runEffect();
  });

  ctx.cleanups.push(() => {
    for (let i = 0; i < unsubs.length; i++) {
      unsubs[i]?.();
    }

    if (lastCleanup) {
      lastCleanup();
    }

    disposeEffect(runEffect);
  });
}
