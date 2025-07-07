import { RumiousState, createState } from './state.js';

export type RumiousStoreReactiveMap < T > = {
  [K in keyof T]: RumiousState < T[K] > ;
};

export class RumiousStore < T extends {} > {
    public states = {} as RumiousStoreReactiveMap < T > ;
    
    constructor(public value: T) {
      this.init(value);
    }
    
    private init(value: T) {
      for (let key in value) {
        this.states[key] = createState(value[key]);
      }
    }
    
    assign(value: T) {
      for (let key in value) {
        if(!this.states[key]) this.states[key] = createState(value[key]);
        else this.states[key].set(value[key]);
      }
    }
    
    get < K extends keyof T > (key: K): RumiousState < T[K] > {
      return this.states[key];
    }
    
    set(value: T): void {
      this.value = value;
      for (const key in value) {
        if (this.states[key]) {
          this.states[key].value = value[key];
        } else {
          this.states[key] = createState(value[key]);
        }
      }
    }
    
    map < U > (fn: <K extends keyof T>(state: RumiousState<T[K]>, key: K) => U): U[] {
    const results: U[] = [];
    for (const key in this.states) {
      results.push(fn(this.states[key], key));
    }
    return results;
  }

  remove<K extends keyof T>(key: K): void {
    delete this.states[key];
    delete this.value[key];
  }
}

export function createStore<T extends {}>(value: T): RumiousStore<T> {
  return new RumiousStore<T>(value);
}