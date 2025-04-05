import { RumiousState } from './state.js';

/**
 * A reactive object wrapper for RumiousState.
 * Allows mutation and key-based access while triggering reactions.
 */
class RumiousObjectState extends RumiousState {
  /**
   * @param {Object} target - The initial object state.
   * @param {Object} [reactor=null] - Optional reactor to trigger on changes.
   * @throws {Error} If the target is not an object.
   */
  constructor(target, reactor = null) {
    if (!(target instanceof Object)) {
      throw Error('RumiousObjectState: The initial value must be an object.');
    }
    super(target, reactor);
  }
  
  /**
   * Sets a new object or a specific key in the object.
   * @param {...any} args - Either (value) or (key, value).
   */
  set(...args) {
    if (args.length === 1) {
      this.value = args[0];
      this.reactor.react({ type: 'SET_VALUE', value: args[0] });
    } else {
      let index = args[0];
      let value = args[1];
      this.value[index] = value;
      this.reactor.react({ type: 'SET_VALUE', index, value });
    }
  }
  
  /**
   * Returns the keys of the object.
   * @returns {string[]}
   */
  keys() {
    return Object.keys(this.value);
  }
  
  /**
   * Returns the values of the object.
   * @returns {any[]}
   */
  values() {
    return Object.values(this.value);
  }
  
  /**
   * Iterates over the object with a callback.
   * @param {(value: any, key: string) => void} callback
   */
  each(callback) {
    for (let [key, val] of Object.entries(this.value)) {
      callback(val, key);
    }
  }
  
  /**
   * Checks if a key exists in the object.
   * @param {string} key
   * @returns {boolean}
   */
  has(key) {
    return this.value[key] !== undefined;
  }
  
  /**
   * Removes a key from the object.
   * @param {string} key
   */
  remove(key) {
    delete this.value[key];
  }
  
  /**
   * Returns entries of the object as [key, value] pairs.
   * @returns {[string, any][]}
   */
  entries() {
    return Object.entries(this.value);
  }
  
  /**
   * Clears the object and notifies the reactor.
   */
  clear() {
    this.value = {};
    this.reactor.react({ type: 'CLEAR' });
  }
  
  /**
   * Merges another object into the current one and notifies the reactor.
   * @param {Object} obj
   */
  merge(obj) {
    if (!(obj instanceof Object)) return;
    Object.assign(this.value, obj);
    this.reactor.react({ type: 'MERGE', value: obj });
  }
  
  /**
   * Maps each entry in the object and returns a new array.
   * @param {(value: any, key: string, index: number) => any} callback
   * @returns {any[]}
   */
  map(callback) {
    return Object.entries(this.value).map(([key, val], idx) =>
      callback(val, key, idx)
    );
  }
}

/**
 * Factory function for RumiousObjectState.
 * @param {Object} [value={}]
 * @returns {RumiousObjectState}
 */
export function createObjectState(value = {}) {
  return new RumiousObjectState(value);
}