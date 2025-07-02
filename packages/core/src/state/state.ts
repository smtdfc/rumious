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
  
  equal(value:T):boolean{
    return value === this.value;
  }
  
  trigger() {
    this.reactor?.notify({
      type: 'set',
      value: this.value,
      state: this
    });
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