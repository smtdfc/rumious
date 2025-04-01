import { createState } from '../state/state.js';

if (!window.RUMIOUS_CONTEXTS) {
  window.RUMIOUS_CONTEXTS = {};
}

/**
 * Manages state and event handling for an application or component.
 * Allows storing data, listening to events, and triggering events.
 */
export class RumiousContext {
  /**
   * Creates a new context instance with initial data and an event registry.
   * @param {Object} [data={}] - Initial state data for the context.
   */
  constructor(data = {}) {
    this.data = data;
    this.events = {};
  }
  
  /**
   * Registers an event listener for a given event name.
   * @param {string} event - The event name.
   * @param {Function} listener - Callback function executed when the event is emitted.
   */
  on(event, listener) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);
  }
  
  /**
   * Removes a specific event listener.
   * @param {string} event - The event name.
   * @param {Function} listener - The listener function to remove.
   */
  off(event, listener) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(l => l !== listener);
  }
  
  /**
   * Emits an event, invoking all registered listeners with the provided arguments.
   * @param {string} event - The event name.
   * @param {...any} args - Arguments to pass to the listener functions.
   */
  emit(event, ...args) {
    if (!this.events[event]) return;
    this.events[event].forEach(listener => listener(...args));
  }
  
  /**
   * Stores a value in the context under the specified key.
   * @param {string} key - The key for storing the value.
   * @param {any} value - The value to store.
   * @returns {any} The stored value.
   */
  set(key, value) {
    this.data[key] = value;
    return value;
  }
  
  /**
   * Retrieves a stored value from the context.
   * @param {string} key - The key associated with the value.
   * @returns {any} The value stored under the key.
   */
  get(key) {
    return this.data[key];
  }
}

/**
 * Creates or retrieves a global context instance.
 * @param {string} [globalName=''] - The unique name for the global context.
 * @param {Object} [data={}] - Initial state data for the context.
 * @returns {RumiousContext} The existing or newly created context instance.
 * @throws {Error} If the initial data is not an object.
 */
export function createContext(globalName = '', data = {}) {
  if (!data || typeof data !== 'object') {
    throw new Error('Rumious context: Initial value must be an object!');
  }
  if (!window.RUMIOUS_CONTEXTS[globalName]) {
    window.RUMIOUS_CONTEXTS[globalName] = new RumiousContext(data);
  }
  return window.RUMIOUS_CONTEXTS[globalName];
}