import type { Effect } from "./effect";

const queue = new Set<Effect>();
let isPending = false;

export function scheduleEffect(effect: Effect) {
  queue.add(effect);
  if (!isPending) {
    isPending = true;
    queueMicrotask(() => {
      queue.forEach((e) => e.run());
      queue.clear();
      isPending = false;
    });
  }
}
