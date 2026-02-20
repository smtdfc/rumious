import type { Effect } from "./effect";

const queue = new Set<Effect>();
let isPending = false;

export function flushEffects() {
  queue.forEach((e) => e.run());
  queue.clear();
  isPending = false;
}

export function scheduleEffect(effect: Effect) {
  if ((window as any).FORCE_SYNC) {
    effect.run();
    return;
  }

  queue.add(effect);
  if (!isPending) {
    isPending = true;
    queueMicrotask(() => {
      flushEffects();
    });
  }
}
