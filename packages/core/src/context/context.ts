import { State, createState } from '../state/index.js';

export type ContextEventCallback = (data: unknown) => unknown;

export class Context<T extends object> {
  private reactiveKeyMap = new Map<keyof T, State<any>>();
  private events: Record<string, ContextEventCallback[]> = {};
  constructor(public values: T) {}

  on(name: string, callback: ContextEventCallback) {
    if (!this.events[name]) this.events[name] = [];
    this.events[name].push(callback);
  }

  off(name: string, callback: ContextEventCallback) {
    if (!this.events[name]) this.events[name] = [];
    this.events[name] = this.events[name].filter((v) => v !== callback);
  }

  emit(name: string, data: T) {
    if (!this.events[name]) this.events[name] = [];
    for (let i = 0; i < this.events[name].length; i++) {
      this.events[name][i](data);
    }
  }

  get(): T {
    return this.values;
  }

  set(value: T) {
    this.values = value;
  }

  setKey<K extends keyof T>(name: K, value: T[K]) {
    this.values[name] = value;
  }

  getKey<K extends keyof T>(name: K): T[K] {
    return this.values[name];
  }

  reactiveKey<K extends keyof T>(key: K): State<T[K]> {
    if (!this.reactiveKeyMap.has(key)) {
      this.reactiveKeyMap.set(key, createState(this.values[key]));
    }
    return this.reactiveKeyMap.get(key) as State<T[K]>;
  }
}
