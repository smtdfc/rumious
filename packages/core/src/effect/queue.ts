import type { EffectFunc } from "./effect";

const pending: EffectFunc[] = [];
const queued = new Set<EffectFunc>();

let isFlushing = false;
let isScheduled = false;

export function enqueueEffect(fn: EffectFunc) {
  if (queued.has(fn)) {
    return;
  }

  queued.add(fn);
  pending.push(fn);
  scheduleFlush();
}

export function scheduleFlush() {
  if (isFlushing || isScheduled) {
    return;
  }

  isScheduled = true;
  queueMicrotask(flushQueue);
}

export function flushQueue() {
  if (isFlushing) {
    return;
  }

  isScheduled = false;
  isFlushing = true;

  try {
    for (let i = 0; i < pending.length; i++) {
      const fn = pending[i]!;

      if (!queued.delete(fn)) {
        continue;
      }

      fn();
    }

    pending.length = 0;
  } finally {
    isFlushing = false;

    if (pending.length > 0) {
      scheduleFlush();
    }
  }
}

export function removeQueuedEffect(fn: EffectFunc) {
  queued.delete(fn);
}
