import {
  enqueueEffect,
  type EffectFunc,
  removeQueuedEffect,
} from "../effect/index.js";
import type { State } from "../state/state.js";
import { getCurrentContext, type Context } from "./context.js";

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
      const unsub = deps[i]!.subscribe(runEffect);
      unsubs.push(unsub);
    }

    enqueueEffect(runEffect);
  });

  ctx.cleanups.push(() => {
    for (let i = 0; i < unsubs.length; i++) {
      unsubs[i]!();
    }

    if (lastCleanup) {
      lastCleanup();
    }

    removeQueuedEffect(runEffect);
  });
}

export function createEffect(
  fn: EffectFunc,
  deps: State<any>[] = [],
  ctx?: Context,
) {
  const current = ctx ?? getCurrentContext();

  if (!current) {
    throw new Error(
      "createEffect must be called during a Rumious render or component execution",
    );
  }

  $$effect(fn, deps, current);
}
