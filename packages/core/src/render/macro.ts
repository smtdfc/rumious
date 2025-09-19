import { State } from '../state/index.js';

export function $<U>(reactive: State<U>): U {
  console.warn('Experimental feature — do not use in production.');
  return reactive.get();
}
