import type { CleanupFunc, EffectFunc } from "./effect";

export let effectQueue = {
  pending: [] as EffectFunc[],
  seen: new Set<EffectFunc>(),
  cleanups: new Map<EffectFunc, CleanupFunc>(),
  isFlushing: false,
};

export function flushQueue() {
  effectQueue.isFlushing = true;

  const queue = effectQueue.pending;
  effectQueue.pending = [];
  effectQueue.seen.clear();

  const len = queue.length;
  for (let i = 0; i < len; i++) {
    const fn = queue[i]!;

    fn();
  }

  if (effectQueue.pending.length > 0) {
    flushQueue();
  } else {
    effectQueue.isFlushing = false;
  }
}

export function disposeEffect(fn: EffectFunc) {
  effectQueue.seen.delete(fn);
}
