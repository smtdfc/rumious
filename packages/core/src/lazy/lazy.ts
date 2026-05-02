export type Lazy<K> = {
  readonly value: Promise<K>;
};

export function lazy<T>(loader: () => T | Promise<T>): Lazy<T> {
  let _promise: Promise<T> | null = null;

  return {
    get value(): Promise<T> {
      if (!_promise) {
        const result = loader();
        _promise = result instanceof Promise ? result : Promise.resolve(result);
      }
      return _promise;
    },
  };
}
