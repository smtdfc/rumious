import { RumiousState } from "./state.js";
import { RumiousReactor } from "./reactor.js";

export class RumiousObjectState<T extends Record<string, any>> extends RumiousState<T> {
  #locked = false;

  constructor(value: T, reactor?: RumiousReactor<T>) {
    super(value, reactor);
  }

  set<K extends string>(key: K, newValue: any): this;
  set(newObject: T): void;
  set(arg1: any, arg2?: any): any {
    if (this.#locked) throw new Error("Object is locked");

    if (typeof arg1 === "string") {
      const key = arg1 as string;
      const newValue = arg2;
      (this.value as any)[key] = newValue;
      this.reactor.emit({
        type: "SET_BY_KEY",
        value: { ...this.value },
        target: this,
        key,
        item: newValue,
      });
      return this;
    } else if (typeof arg1 === "object") {
      super.set(arg1);
    } else {
      throw new Error("Invalid arguments passed to set()");
    }
  }

  remove<K extends string>(key: K): this {
    if (this.#locked) throw new Error("Object is locked");

    if (key in this.value) {
      delete this.value[key];
      this.reactor.emit({
        type: "REMOVE_BY_KEY",
        value: { ...this.value },
        target: this,
        key,
      });
    }
    return this;
  }

  merge(partial: Partial<T>): this {
    if (this.#locked) throw new Error("Object is locked");

    Object.assign(this.value, partial);
    this.reactor.emit({
      type: "SET",
      value: { ...this.value },
      target: this
    });
    return this;
  }

  assign(obj: Partial<T>): this {
    if (this.#locked) throw new Error("Object is locked");

    this.value = { ...this.value, ...obj };
    this.reactor.emit({
      type: "SET",
      value: { ...this.value },
      target: this,
    });
    return this;
  }

  

  clear(): this {
    if (this.#locked) throw new Error("Object is locked");

    for (const key in this.value) {
      delete this.value[key];
    }
    this.reactor.emit({
      type: "SET",
      value: {} as T,
      target: this,
    });
    return this;
  }


  get<K extends string>(key: K): any;
  get(): T;
  get(arg?: any): any {
    return typeof arg === "string" ? this.value[arg] : this.value;
  }

  keys(): string[] {
    return Object.keys(this.value);
  }

  values(): any[] {
    return Object.values(this.value);
  }

  entries(): [string, any][] {
    return Object.entries(this.value);
  }

  has(key: string): boolean {
    return key in this.value;
  }

  get size(): number {
    return Object.keys(this.value).length;
  }

  forEach(callback: (value: any, key: string, obj: T) => void): void {
    Object.entries(this.value).forEach(([key, value]) => {
      callback(value, key, this.value);
    });
  }

  map(callback: (value: any, key: string, obj: T) => any): Record<string, any> {
    const result: Record<string, any> = {};
    Object.entries(this.value).forEach(([key, value]) => {
      result[key] = callback(value, key, this.value);
    });
    return result;
  }


  clone(): T {
    return JSON.parse(JSON.stringify(this.value));
  }

  toJSON(): Record<string, any> {
    return JSON.parse(JSON.stringify(this.value));
  }

  toObject(): T {
    return this.get();
  }

  lock(): this {
    this.#locked = true;
    return this;
  }

  unlock(): this {
    this.#locked = false;
    return this;
  }

  get isLocked(): boolean {
    return this.#locked;
  }

  freeze(): this {
    Object.freeze(this.value);
    return this;
  }

  unfreeze(): this {
    this.value = JSON.parse(JSON.stringify(this.value));
    return this;
  }

  get isFrozen(): boolean {
    return Object.isFrozen(this.value);
  }
}

export function createObjectState<T extends Record<string, any>>(value: T) {
  return new RumiousObjectState<T>(value);
}