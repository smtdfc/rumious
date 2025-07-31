import { StateReactor,StateBinding } from './reactor.js';

export const STATE_SYMBOL: unique symbol = Symbol('State@Symbol');

function shallowEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true;
  if (!obj1 || !obj2) return false;
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  if (keys1.length !== keys2.length) return false;
  for (const key of keys1) {
    if (obj1[key] !== obj2[key]) return false;
  }
  return true;
}

export class State<T> {
  private keysWrap = new Map<string, State<unknown>>();
  private wrapCache = new WeakMap<Function, State<unknown>>();
  [STATE_SYMBOL]: unknown = { instance: this };

  public reactor = new StateReactor<T>(this);

  constructor(protected value: T) {}

  set(value: T) {
    const same =
      typeof value === 'object' && value !== null
        ? shallowEqual(this.value, value)
        : this.value === value;

    if (same) return;

    this.value = value;
    this.reactor.trigger({ type: 'set', target: this, value });
  }

  get(): T {
    return this.value;
  }

  update(cb: (v: T) => T) {
    const newValue = cb(this.value);

    const same =
      typeof newValue === 'object' && newValue !== null
        ? shallowEqual(this.value, newValue)
        : this.value === newValue;

    if (same) return;

    this.set(newValue);
  }

  setInSlient(value: T) {
    this.value = value;
  }

  forceReactive() {
    this.reactor.trigger({ type: 'force' });
  }

  wrap<K>(cb: (val: T) => K): State<K> {
    if (this.wrapCache.has(cb)) {
      return this.wrapCache.get(cb) as State<K>;
    }

    const state = new State<K>(cb(this.value));
    this.wrapCache.set(cb, state);

    this.reactor.addInternalBinding(() => {
      state.set(cb(this.value));
    });

    return state;
  }

  setKey<K extends keyof T>(key: K, value: T[K]) {
    if (this.value[key] === value) return;
    this.value[key] = value;

    this.reactor.trigger({
      type: 'update',
      target: this,
      value: this.value,
      key,
    });

    const fieldState = this.keysWrap.get(key as string);
    if (fieldState) fieldState.set(value);
  }

  setByIndex<U>(this: State<U[]>, index: number, value: U) {
    if (!Array.isArray(this.value)) {
      throw new Error(
        'RumiousStateError: setByIndex can only be used on array value.',
      );
    }

    if (this.value[index] === value) return;

    this.value[index] = value;

    this.reactor.trigger({
      type: 'update',
      target: this,
      value: this.value,
      key: index,
    });
  }

  getKey<K extends keyof T>(key: K): T[K] {
    return this.value[key];
  }

  wrapKey<K extends keyof T>(key: K): State<T[K]> {
    const keyStr = key as string;

    if (!this.keysWrap.has(keyStr)) {
      const fieldState = createState(this.getKey(key));
      this.keysWrap.set(keyStr, fieldState);

      this.reactor.addInternalBinding(() => {
        fieldState.set(this.getKey(key));
      });
    }

    return this.keysWrap.get(keyStr)! as State<T[K]>;
  }

  insertAt<U>(this: State<U[]>, index: number, value: U) {
    if (!Array.isArray(this.value)) {
      throw new Error(
        'RumiousStateError: insertAt can only be used on array value.',
      );
    }

    if (index < 0 || index > this.value.length) {
      throw new Error('RumiousStateError: Index out of bounds.');
    }

    this.value.splice(index, 0, value);
    this.reactor.trigger({
      type: 'insert',
      target: this,
      value: this.value,
      key: index,
    });
  }

  removeAt<U>(this: State<U[]>, index: number) {
    if (!Array.isArray(this.value)) {
      throw new Error(
        'RumiousStateError: removeAt can only be used on array value.',
      );
    }

    if (index < 0 || index >= this.value.length) {
      throw new Error('RumiousStateError: Index out of bounds.');
    }

    this.value.splice(index, 1);
    this.reactor.trigger({
      type: 'remove',
      target: this,
      value: this.value,
      key: index,
    });
  }

  append<U>(this: State<U[]>, value: U) {
    this.insertAt(this.value.length, value);
  }

  prepend<U>(this: State<U[]>, value: U) {
    this.insertAt(0, value);
  }

  map<U>(this: State<U[]>, cb: (item: U, index: number) => unknown): unknown[] {
    return this.value.map(cb);
  }
}

export function wrapState<T, K>(cb: (val: T) => K, parent: State<T>): State<K> {
  const state = new State(cb(parent.get()));
  parent.reactor.addInternalBinding(() => {
    state.set(cb(parent.get()));
  });
  return state;
}

export function createState<T>(value: T): State<T> {
  return new State<T>(value);
}

export function isState(val: unknown): val is State<unknown> {
  return (
    typeof val === 'object' && val !== null && STATE_SYMBOL in (val as object)
  );
}

export function watch<T>(state:State<T>, callback:StateBinding){
  state.reactor.addBinding(callback);
}

export function unwatch<T>(state:State<T>, callback:StateBinding){
  state.reactor.removeBinding(callback);
}
