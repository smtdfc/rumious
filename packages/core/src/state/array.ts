import { RumiousState } from './state.js';
import { RumiousReactor } from './reactor.js';

export class RumiousArrayState<T> extends RumiousState<T[]> {
  constructor(value: T[], reactor?: RumiousReactor<T[]>) {
    super(value, reactor);
  }

  set(value: T[]): void;
  set(index: number, value: T): void;
  set(arg1: any, arg2?: any): void {
    if (typeof arg1 === 'number' && arg2 !== undefined) {
      const index = arg1 as number;
      const newValue = arg2 as T;
      this.value[index] = newValue;
      this.reactor.emit({
        type: 'SET_BY_KEY',
        value: [...this.value],
        target: this,
        key: index,
        item: newValue,
      });
    } else if (Array.isArray(arg1)) {
      super.set(arg1);
    } else {
      throw new Error('Invalid arguments passed to set()');
    }
  }

  get(index: number): T;
  get(): T[];
  get(arg?: any): any {
    return typeof arg === 'number' ? this.value[arg] : this.value;
  }

  insert(index: number, newItem: T): this {
    this.value.splice(index, 0, newItem);
    this.reactor.emit({
      type: 'INSERT_BY_KEY',
      value: this.value,
      target: this,
      key: index,
      item: newItem,
    });
    return this;
  }

  remove(index: number): this {
    this.value.splice(index, 1);
    this.reactor.emit({
      type: 'REMOVE_BY_KEY',
      value: this.value,
      target: this,
      key: index,
    });
    return this;
  }

  append(value: T): this {
    this.value.push(value);
    this.reactor.emit({
      type: 'APPEND',
      value: this.value,
      target: this,
      item: value,
    });
    return this;
  }

  clear(): this {
    this.value.length = 0;
    this.reactor.emit({
      type: 'SET',
      value: [],
      target: this,
    });
    return this;
  }

  replace(index: number, newItem: T): this {
    if (index < 0 || index >= this.value.length) {
      throw new Error('Index out of bounds');
    }
    this.value[index] = newItem;
    this.reactor.emit({
      type: 'SET_BY_KEY',
      value: [...this.value],
      target: this,
      key: index,
      item: newItem,
    });
    return this;
  }

  filter(callback: (item: T, index: number, array: T[]) => boolean): this {
    this.value = this.value.filter(callback);
    this.reactor.emit({
      type: 'SET',
      value: this.value,
      target: this,
    });
    return this;
  }

  map(callback: (item: T, index: number, array: T[]) => T): this {
    this.value = this.value.map(callback);
    this.reactor.emit({
      type: 'SET',
      value: this.value,
      target: this,
    });
    return this;
  }

  sort(compareFn?: (a: T, b: T) => number): this {
    this.value.sort(compareFn);
    this.reactor.emit({
      type: 'SET',
      value: this.value,
      target: this,
    });
    return this;
  }

  reverse(): this {
    this.value.reverse();
    this.reactor.emit({
      type: 'SET',
      value: this.value,
      target: this,
    });
    return this;
  }

  get length(): number {
    return this.value.length;
  }

  forEach(callback: (value: T, index: number) => void): void {
    this.value.forEach(callback);
  }
}

export function createArrayState<T>(value: T[]) {
  return new RumiousArrayState<T>(value);
}
