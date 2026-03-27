import { enqueueEffect, type EffectFunc } from "../effect/index.js";

export type StateOptions<T> = {
  equal?: (oldValue: T, newValue: T) => boolean;
};

const defaultStateOptions: StateOptions<any> = {
  equal(oldValue, newValue) {
    return oldValue === newValue;
  },
};

type ArrayItem<T> = T extends (infer U)[] ? U : never;

export type ArrayMutationEvent<T> =
  | { type: "setByIndex"; index: number; value: T }
  | { type: "insert"; index: number; value: T }
  | { type: "remove"; index: number }
  | { type: "append"; value: T }
  | { type: "prepend"; value: T }
  | { type: "swap"; indexA: number; indexB: number };

export class State<T> {
  private value: T;
  private subscribers = new Set<EffectFunc>();
  private arrayMutations: ArrayMutationEvent<any>[] = [];

  constructor(
    initialValue: T,
    public options = defaultStateOptions,
  ) {
    this.value = initialValue;
  }

  set(value: T, preserveArrayMutations = false) {
    const oldValue = this.value;
    if (this.options.equal?.(oldValue, value)) {
      return;
    }

    if (!preserveArrayMutations) {
      this.arrayMutations.length = 0;
    }

    this.value = value;
    this.trigger();
  }

  get() {
    return this.value;
  }

  update(fn: (current: T) => T) {
    this.set(fn(this.value));
  }

  clear() {
    const array = this.asArray();
    if (array.length === 0) return;

    this.arrayMutations.push(
      ...array.map((_, i) => ({ type: "remove" as const, index: 0 })),
    );
    this.set([] as any, true);
  }

  subscribe(fn: EffectFunc) {
    this.subscribers.add(fn);

    return () => {
      this.subscribers.delete(fn);
    };
  }

  private trigger() {
    for (const fn of this.subscribers) {
      enqueueEffect(fn);
    }
  }

  unsubscribe(fn: EffectFunc) {
    this.subscribers.delete(fn);
  }

  drainArrayMutations(): ArrayMutationEvent<ArrayItem<T>>[] {
    const out = this.arrayMutations as ArrayMutationEvent<ArrayItem<T>>[];
    this.arrayMutations = [];
    return out;
  }

  private asArray(): ArrayItem<T>[] {
    if (!Array.isArray(this.value)) {
      throw new Error("Array helper called on non-array State");
    }

    return this.value as ArrayItem<T>[];
  }

  setByIndex(index: number, value: ArrayItem<T>) {
    const array = this.asArray();
    if (index < 0 || index >= array.length) {
      return;
    }

    const next = array.slice();
    next[index] = value;
    this.arrayMutations.push({ type: "setByIndex", index, value });
    this.set(next as T, true);
  }

  insert(index: number, value: ArrayItem<T>) {
    const array = this.asArray();
    const clampedIndex = Math.max(0, Math.min(index, array.length));
    const next = array.slice();
    next.splice(clampedIndex, 0, value);
    this.arrayMutations.push({
      type: "insert",
      index: clampedIndex,
      value,
    });
    this.set(next as T, true);
  }

  remove(index: number) {
    const array = this.asArray();
    if (index < 0 || index >= array.length) {
      return;
    }

    const next = array.slice();
    next.splice(index, 1);
    this.arrayMutations.push({ type: "remove", index });
    this.set(next as T, true);
  }

  append(value: ArrayItem<T>) {
    const array = this.asArray();
    this.arrayMutations.push({ type: "append", value });
    this.set([...array, value] as T, true);
  }

  prepend(value: ArrayItem<T>) {
    const array = this.asArray();
    this.arrayMutations.push({ type: "prepend", value });
    this.set([value, ...array] as T, true);
  }

  swap(indexA: number, indexB: number) {
    const array = this.asArray();
    const len = array.length;

    if (
      indexA < 0 ||
      indexA >= len ||
      indexB < 0 ||
      indexB >= len ||
      indexA === indexB
    ) {
      return;
    }

    const next = array.slice();
    const temp = next[indexA]!;
    next[indexA] = next[indexB]!;
    next[indexB] = temp;
    this.arrayMutations.push({ type: "swap", indexA, indexB });
    this.set(next as T, true);
  }

  map(
    fn: (
      item: ArrayItem<T>,
      index: number,
      array: ArrayItem<T>[],
    ) => ArrayItem<T>,
  ) {
    const array = this.asArray();
    const next = array.map(fn);
    this.set(next as T);
  }

  forEach(
    fn: (item: ArrayItem<T>, index: number, array: ArrayItem<T>[]) => void,
  ) {
    this.asArray().forEach(fn);
  }
}

export function createState<T>(value: T) {
  return new State(value);
}

export function createCompute<T, R>(
  source: State<T>,
  fn: (val: T) => R,
): State<R> {
  const computed = new State(fn(source.get()));
  source.subscribe(() => {
    computed.set(fn(source.get()));
  });
  return computed;
}
