import { RumiousReactor, RumiousBinding } from './reactor.js';
import { create } from 'mutative';

type RumiousStateProduceCallback<T> = (draft: T) => void;

export class RumiousState<T> {
  public value: T;
  public reactor: RumiousReactor<T>;

  constructor(value: T, reactor?: RumiousReactor<T>) {
    this.value = value;
    this.reactor = reactor ?? new RumiousReactor<T>(this);
  }

  set(value: T): void {
    this.value = value;
    this.reactor.emit({
      type: 'SET',
      target: this,
      value: value,
    });
  }

  get(): T {
    return this.value;
  }

  increase(count: number = 1): void {
    if (typeof this.value === 'number') {
      this.set((this.value + count) as T);
    }
  }

  produce(callback: RumiousStateProduceCallback<T>): void {
    const [draft, finalize] = create(this.value);
    callback(draft as T);
    this.set(finalize() as T);
  }
}

export function watch<T>(state: RumiousState<T>, fn: RumiousBinding<T>): void {
  state.reactor.addBinding(fn);
}

export function unwatch<T>(
  state: RumiousState<T>,
  fn: RumiousBinding<T>
): void {
  state.reactor.removeBinding(fn);
}

export function createState<T>(value: T): RumiousState<T> {
  return new RumiousState<T>(value);
}
