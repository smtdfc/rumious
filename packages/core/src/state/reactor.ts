import type { RumiousState } from './state.js';

type RumiousStateCommitTypes =
  | 'SET'
  | 'SET_BY_KEY'
  | 'REMOVE_BY_KEY'
  | 'APPEND'
  | 'INSERT_BY_KEY'
  | 'PREPEND';

export interface RumiousStateCommit<T> {
  type: RumiousStateCommitTypes;
  target: RumiousState<T>;
  value: unknown;
  key?: string | number;
}

export type RumiousBinding<T> = (commit: RumiousStateCommit<T>) => void;

export class RumiousReactor<T> {
  private bindings: RumiousBinding<T>[];
  constructor(public target: RumiousState<T>) {
    this.bindings = [];
  }

  addBinding(bind: RumiousBinding<T>) {
    this.bindings.push(bind);
  }

  removeBinding(bind: RumiousBinding<T>) {
    this.bindings = this.bindings.filter((_) => _ !== bind);
  }

  async emit(commit: RumiousStateCommit<T>): Promise<void> {
    await Promise.allSettled(
      this.bindings.map((bind) => {
        try {
          const result = bind(commit);
          return (result as any) instanceof Promise
            ? result
            : Promise.resolve(result);
        } catch (err) {
          return Promise.reject(err);
        }
      })
    );
  }
}
