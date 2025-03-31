import { RumiousReactor } from './reactive.js';
import { RumiousReducer } from './reducer.js';
import { produceState } from './produce.js';

/**
 * Represents a reactive state in Rumious
 * 
 */
export class RumiousState {
  /**
   * 
   * @constructor
   * @param {any} target - The initial state value.
   * @param {RumiousReactor|null} [reactor=null] - The reactor that handles reactivity.
   */
  constructor(target, reactor = null) {
    this.value = target;
    this.reactor = reactor ?? new RumiousReactor(this, []);
  }
  
  /**
   * Produces a new state based on a recipe function.
   * @param {Function} recipe - A function that modifies the draft state.
   * @returns {RumiousState} - The new state instance.
   */
  produce(recipe) {
    return produceState(this, recipe);
  }
  
  /**
   * Creates a reducer function that updates the state.
   * @param {string|Function} [arg1] - The action type or reducer function.
   * @param {Function} [arg2] - The reducer function if the first argument is a string.
   * @returns {Function} - A bound function that triggers state updates.
   */
  reducer(...args) {
    let computedObj;
    if (args.length === 1) {
      computedObj = new RumiousReducer(this, '', args[0]);
    } else {
      computedObj = new RumiousReducer(this, args[0], args[1]);
    }
    return computedObj.trigger.bind(computedObj);
  }
  
  /**
   * Sets a nested value in the state using a dot-separated path.
   * @param {string} path - The path to the value in the object.
   * @param {any} value - The value to set at the specified path.
   * @throws {Error} If the provided path is invalid.
   */
  setObjectByPath(path = '', value) {
    if (path.length === 0) {
      this.value = value;
      return;
    }
    
    if (typeof path !== 'string' || !path) {
      throw new Error('Invalid path');
    }
    
    let keys = path.split('.');
    let obj = this.value;
    
    for (let i = 0; i < keys.length - 1; i++) {
      let key = keys[i];
      if (!(key in obj)) {
        obj[key] = {};
      }
      obj = obj[key];
    }
    
    obj[keys[keys.length - 1]] = value;
  }
  
  /**
   * Sets the state value, either directly or via a path.
   * @param {string|any} [arg1] - The path if updating a nested value, otherwise the new value.
   * @param {any} [arg2] - The value to set if updating a nested property.
   */
  set(...args) {
    if (args.length === 1) {
      this.value = args[0];
      this.reactor.react({type:"SET_VALUE",value:args[0]});
    } else {
      let path = args[0];
      let value = args[1];
      this.setObjectByPath(path, value);
      this.reactor.react({type:"SET_VALUE",path,value});
    }
  }
  
  /**
   * Retrieves the current state value.
   * @returns {any} The current state.
   */
  get() {
    return this.value;
  }
}

/**
 * Creates a new reactive state.
 * 
 * @param {any} value - The initial value of the state.
 * @returns {RumiousState} The newly created state.
 */
export function createState(value) {
  return new RumiousState(value);
}

/**
 * Checks if an object is an instance of RumiousState.
 * 
 * @param {any} obj - The object to check.
 * @returns {boolean} True if the object is a RumiousState, false otherwise.
 */
export function isState(obj) {
  return obj instanceof RumiousState;
}