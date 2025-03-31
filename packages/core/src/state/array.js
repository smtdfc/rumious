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
      throw Error('RumiousStateArray: The initial value must be an array.');
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
  set(...args) {
    if (args.length === 1) {
      this.value = args[0];
      this.reactor.react({ type: 'SET_VALUE', value: args[0] });
    } else {
      let index = args[0];
      let value = args[1];
      this.value[index] = value;
      this.reactor.react({ type: 'SET_ELEMENT', index, value });
    }
  }
  
  /**
   * Appends a new value to the end of the array.
   * This method will trigger the reactor to react with an "APPEND_ELEMENT" type.
   * 
   * @param {*} value - The value to append to the array.
   */
  append(value) {
    this.value.push(value);
    this.reactor.react({ type: 'ADD_ELEMENT', value, index: this.value.length - 1 });
  }
  
  /**
   * Retrieves the value at the specified index in the array.
   * This method will return the element at the given index of the array.
   * 
   * @param {number} idx - The index of the element to retrieve.
   * @returns {*} The element at the specified index.
   */
  index(idx) {
    return this.value[idx];
  }
  
  /**
   * Removes an element at the specified index from the array.
   * This method will modify the array by removing the element at the given index.
   * 
   * @param {number} idx - The index of the element to remove.
   */
  remove(idx) {
    if (idx >= 0 && idx < this.value.length) {
      this.value.splice(idx, 1);
      this.reactor.react({ type: 'REMOVE_ELEMENT', index: idx });
    }
  }
  
  /**
   * Inserts an element at the specified index in the array.
   * This method will modify the array by adding the new element at the given index.
   * 
   * @param {number} idx - The index where the element should be inserted.
   * @param {*} element - The element to insert into the array.
   */
  insert(idx, value) {
    if (idx >= 0 && idx <= this.value.length) {
      this.value.splice(idx, 0, value);
      this.reactor.react({ type: 'INSERT_ELEMENT', index: idx, value });
    }
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