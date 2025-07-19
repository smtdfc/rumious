import type { State } from './state.js';

export type StateCommitType =
  | 'set'
  | 'force'
  | 'append'
  | 'prepend'
  | 'insert'
  | 'remove'
  | 'update';

export type StateCommit<T> = {
  type: StateCommitType;
  target?: State<T>;
  value?: unknown;
  key?: string | number | symbol;
};

export type StateBinding = (commit: StateCommit<unknown>) => void;

export class StateReactor<T> {
  private bindings: Set<StateBinding> = new Set();
  private internalBindings: Set<StateBinding> = new Set();

  private triggerQueue: Set<StateBinding> = new Set();
  private scheduled: boolean = false;

  constructor(public state: State<T>) {}

  addInternalBinding(binding: StateBinding) {
    this.internalBindings.add(binding);
  }

  removeInternalBinding(binding: StateBinding) {
    this.internalBindings.delete(binding);
  }

  addBinding(binding: StateBinding) {
    this.bindings.add(binding);
  }

  removeBinding(binding: StateBinding) {
    this.bindings.delete(binding);
  }

  trigger(commit: StateCommit<T>) {
    for (const cb of this.internalBindings) {
      this.triggerQueue.add(cb);
    }

    for (const cb of this.bindings) {
      this.triggerQueue.add(cb);
    }

    if (!this.scheduled) {
      this.scheduled = true;
      queueMicrotask(() => {
        for (const cb of this.triggerQueue) {
          try {
            cb(commit);
          } catch (err) {
            console.error('[StateReactor] callback error:', err);
          }
        }
        this.triggerQueue.clear();
        this.scheduled = false;
      });
    }
  }

  clear() {
    this.bindings.clear();
    this.internalBindings.clear();
    this.triggerQueue.clear();
  }

  get stats() {
    return {
      bindings: this.bindings.size,
      internalBindings: this.internalBindings.size,
      queued: this.triggerQueue.size,
    };
  }
}
