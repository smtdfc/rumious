/**
 * A class that handles reactivity by managing bindings to a target object.
 * 
 */
export class RumiousReactor {
  /**
   * @constructor
   * @param {any} [target=null] - The target object to which the reactor is attached.
   * @param {Function[]} [bindings=[]] - The list of functions that are triggered when the state changes.
   */
  constructor(target = null, bindings = []) {
    this.target = target;
    this.bindings = bindings;
  }
  
  /**
   * Triggers all registered bindings (callbacks) to react to changes in the target.
   */
  react() {
    this.bindings.forEach((callback) => callback());
  }
  
  /**
   * Removes a specific binding (callback) from the reactor.
   * @param {Function} fn - The callback function to remove from the bindings list.
   */
  removeBinding(fn) {
    for (let i = this.bindings.length - 1; i >= 0; i--) {
      if (this.bindings[i] === fn) {
        this.bindings.splice(i, 1);
      }
    }
  }
  
  /**
   * Adds a new binding (callback) to the reactor to react to state changes.
   * @param {Function} fn - The callback function to add to the bindings list.
   */
  addBinding(fn) {
    this.bindings.push(fn);
  }
}