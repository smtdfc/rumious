import { RumiousState } from './state.js';

/**
 * Represents a custom state for managing arrays.
 * This class extends RumiousState and provides additional methods for
 * interacting with array-like data.
 * 
 * @extends RumiousState
 */
class RumiousArrayState extends RumiousState {
  /**
   * Creates an instance of RumiousArrayState.
   * 
   * @param {Array} target - The initial array value to be managed by this state.
   * @param {Object|null} [reactor=null] - An optional reactor object for handling changes.
   * @throws {Error} If the target is not an array.
   */
  constructor(target, reactor = null) {
    if (!(target instanceof Array)) {
      throw Error("RumiousStateArray: The initial value must be an array.");
    }
    super(target, reactor);
  }
  
  /**
   * Sets a value at a specific index in the array.
   * This method will trigger the reactor to react with a "SET_ELEMENT" type.
   * 
   * @param {number} [index=0] - The index of the array element to update.
   * @param {*} value - The new value to set at the given index.
   */
  set(index = 0, value) {
    this.value[index] = value;
    this.reactor.react({ type: "SET_ELEMENT", index, value });
  }
  
  /**
   * Appends a new value to the end of the array.
   * This method will trigger the reactor to react with an "APPEND_ELEMENT" type.
   * 
   * @param {*} value - The value to append to the array.
   */
  append(value) {
    this.value.push(value);
    this.reactor.react({ type: "APPEND_ELEMENT", value, index: this.value.length - 1 });
  }
}

/**
 * Creates a new instance of RumiousArrayState with the provided initial value.
 * 
 * @param {Array} [value=[]] - The initial array value to be managed by the state.
 * @returns {RumiousArrayState} A new RumiousArrayState instance.
 */
export function createArrayState(value = []) {
  return new RumiousArrayState(value);
}