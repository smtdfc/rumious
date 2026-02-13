export class State<T> {
  private _value: T;
  subscribers: Set<(value: T) => void> = new Set();

  constructor(initialValue: T) {
    this._value = initialValue;
  }

  public get(): T {
    return this._value;
  }

  public set(newValue: T): void {
    if (Object.is(this._value, newValue)) return;
    this._value = newValue;
    this.subscribers.forEach((subscriber) => subscriber(newValue));
  }

  public subscribe(subscriber: (value: T) => void): void {
    this.subscribers.add(subscriber);
  }

  public unsubscribe(subscriber: (value: T) => void): void {
    this.subscribers.delete(subscriber);
  }
}

export function createState<T>(initialValue: T): State<T> {
  return new State<T>(initialValue);
}
