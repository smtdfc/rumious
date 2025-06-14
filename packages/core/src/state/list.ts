import { RumiousState } from './state.js';
import { RumiousReactor } from './reactor.js';

export class RumiousListState < T > extends RumiousState < T[] > {
  constructor(
    value: T[] = [],
    reactor ? : RumiousReactor < RumiousState < T[] >>
  ) {
    super(value, reactor);
  }
  
  append(value: T) {
    this.value.push(value);
    this.reactor?.notify({
      type: 'append',
      state: this,
      value
    });
  }
  
  prepend(value: T) {
    this.value.unshift(value);
    this.reactor?.notify({
      type: 'prepend',
      state: this,
      value
    });
  }
  
  insert(pos: number, value: T) {
    this.value.splice(pos, 0, value);
    this.reactor?.notify({
      type: 'insert',
      state: this,
      value,
      key: pos
    });
  }
  
  updateAt(pos: number, value: T) {
    this.value[pos] = value;
    this.reactor?.notify({
      type: 'update',
      state: this,
      value,
      key: pos
    });
  }
  
  remove(pos: number) {
    let currentValue = this.value[pos];
    this.value.splice(pos, 1);
    this.reactor?.notify({
      type: 'remove',
      state: this,
      value: currentValue,
      key: pos
    });
  }
  
  clear() {
    this.value.length = 0;
    this.reactor?.notify({
      type: 'set',
      state: this,
      value: []
    });
  }
  
  reverse() {
    this.value.reverse();
    this.reactor?.notify({
      type: 'set',
      state: this,
      value: this.value
    });
  }
  
  filter(predicate: (item: T, index: number, array: T[]) => boolean) {
    this.value = this.value.filter(predicate);
    this.reactor?.notify({
      type: 'set',
      state: this,
      value: this.value
    });
  }
  
}

export function createListState<T>(
  values:T[]
):RumiousListState<T>{
  return new RumiousListState(values);
}