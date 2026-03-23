import { effectQueue, flushQueue, type EffectFunc } from "../effect/index.js";

export type StateOptions<T> = {
  equal?: (oldValue: T, newValue: T) => boolean;
};

const defaultStateOptions: StateOptions<any> = {
  equal(oldValue, newValue) {
    return oldValue === newValue;
  },
};

export class State<T> {
  private value: T;
  private subscribers = new Set<EffectFunc>();

  constructor(
    initialValue: T,
    public options = defaultStateOptions,
  ) {
    this.value = initialValue;
  }

  set(value: T) {
    const oldValue = this.value;
    if (this.options.equal?.(oldValue, value)) {
      return;
    }
    this.value = value;
    this.trigger();
  }

  get() {
    return this.value;
  }

  subscribe(fn: EffectFunc) {
    this.subscribers.add(fn);

    return () => {
      this.subscribers.delete(fn);
    };
  }

  private trigger() {
    this.subscribers.forEach((fn) => effectQueue.pending.push(fn));

    if (!effectQueue.isFlushing) {
      effectQueue.isFlushing = true;
      queueMicrotask(flushQueue);
    }
  }

  unsubscribe(fn: EffectFunc) {
    this.subscribers.delete(fn);
  }
}

export function createState<T>(value: T) {
  return new State(value);
}
