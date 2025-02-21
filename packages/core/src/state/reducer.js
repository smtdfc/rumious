/**
 * A class that represents a reducer for managing state changes in Rumious.
 * 
 */
export class RumiousReducer {
  /**
   * @constructor
   * @param {RumiousState} state - The state object to which the reducer will apply changes.
   * @param {string} [path=''] - The optional path to a nested state value to update.
   * @param {Function} fn - The reducer function that will compute the new value for the state.
   */
  constructor(state, path = '', fn) {
    this.state = state;
    this.path = path;
    this.fn = fn;
  }
  
  /**
   * Executes the reducer function and updates the state.
   * @param {...any} args - Arguments to pass to the reducer function.
   */
  trigger(...args) {
    let value = this.fn(...args);
    this.state.set(this.path, value);
  }
}