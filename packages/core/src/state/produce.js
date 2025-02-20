import { create } from 'mutative';

/**
 * Produces a new state by applying a recipe function on the current state.
 * It creates a new state object with the changes and updates the original state.
 * @module rumious
 * @param {RumiousState} state - The current state to be modified.
 * @param {Function} fn - The recipe function that receives the current state and produces a new state.
 */
export function produceState(state, fn) {
  state.set(create(state.get(), fn));
}