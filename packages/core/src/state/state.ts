import { RumiousReactor } from './reactor.js';
import { RumiousStateBind } from '../types/index.js';

export class RumiousState < T > {
  
  constructor(
    public value: T,
    public reactor ? : RumiousReactor < RumiousState < T >>
  ) {
    if (!this.reactor) {
      this.reactor = new RumiousReactor < RumiousState < T >> (this);
    }
  }
  
  set(value: T) {
    this.value = value;
    this.reactor?.notify({
      type: 'set',
      value: value,
      state: this
    });
  }
  
  get(): T {
    return this.value;
  }
  
  slientUpdate(value: T) {
    this.value = value;
  }
  
  update(updater: (value: T) => T) {
    this.set(updater(this.value));
  }
  
  toJSON(): string {
    return JSON.stringify(this.value);
  }
  
  equal(value: T): boolean {
    return value === this.value;
  }
  
  trigger() {
    this.reactor?.notify({
      type: 'set',
      value: this.value,
      state: this
    });
  }
  
  entries(): [any, any][] {
    if (this.value && typeof this.value === "object") return Object.entries(this.value);
    return [];
  }
  
  map <R> (callback: (value: unknown, key: any) => R): R[] {
    const val = this.value;
    
    if (Array.isArray(val)) {
      return val.map((v, i) => callback(v, i)); 
    }
    
    if (val && typeof val === "object") {
      return Object.entries(val).map(([k, v]) => callback(v, k));
    }
    
    return [];
  }
}


export function createState < T > (value: T): RumiousState < T > {
  return new RumiousState < T > (value);
}

type StateBindFor < M > = RumiousStateBind < RumiousState < M >> ;

export function watch < M > (
  state: RumiousState < M > ,
  callback: StateBindFor < M >
) {
  if (state.reactor) state.reactor.addBinding(callback);
}

export function unwatch < M > (
  state: RumiousState < M > ,
  callback: StateBindFor < M >
) {
  if (state.reactor) state.reactor.removeBinding(callback);
}