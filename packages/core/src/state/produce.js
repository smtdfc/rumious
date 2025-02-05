import { create } from 'mutative';

export function produceState(state, fn) {
  state.set(create(state.get(), fn));
}