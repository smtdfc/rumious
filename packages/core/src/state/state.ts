export class State<T> {
  private _value: T;
  subscribers: Set<(value: T) => void> = new Set();

  constructor(initialValue: T) {
    this._value = initialValue;
  }

  get(): T {
    return this._value;
  }

  set(newValue: T): void {
    if (Object.is(this._value, newValue)) return;
    this._value = newValue;
    this.subscribers.forEach((subscriber) => subscriber(newValue));
  }

  update(updateFn: (value: T) => T) {
    const oldValue = this._value;
    const newValue = updateFn(oldValue);

    this.set(newValue);
  }

  mutate(fn: (value: T) => void) {
    fn(this._value);
    this.subscribers.forEach((subscriber) => subscriber(this._value));
  }

  subscribe(subscriber: (value: T) => void): void {
    this.subscribers.add(subscriber);
  }

  unsubscribe(subscriber: (value: T) => void): void {
    this.subscribers.delete(subscriber);
  }

  toString() {
    return this._value;
  }
}

export function createState<T>(initialValue: T): State<T> {
  return new State<T>(initialValue);
}
