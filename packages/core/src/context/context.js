import { createState } from '../state/state.js';

if (!window.RUMIOUS_CONTEXTS) {
  window.RUMIOUS_CONTEXTS = {};
}

/**
 * Represents a context that manages state and events for a specific application or component.
 * The context allows you to store data, listen to events, and trigger events.
 * @module rumious
 * 
 */
export class RumiousContext {
  /**
   * Creates an instance of RumiousContext.
   * Initializes the context with given data and sets up an empty events object.
   * @constructor
   * @param {Object} [data={}] - Initial data to be stored in the context.
   */
  constructor(data = {}) {
    this.data = data;
    this.events = {};
  }
  
  /**
   * Registers an event listener for a specific event.
   * 
   * @param {string} event - The name of the event.
   * @param {Function} listener - The function to be called when the event is emitted.
   */
  on(event, listener) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);
  }
  
  /**
   * Removes an event listener for a specific event.
   * 
   * @param {string} event - The name of the event.
   * @param {Function} listener - The listener to remove.
   */
  off(event, listener) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(l => l !== listener);
  }
  
  /**
   * Emits an event and calls all registered listeners with the given arguments.
   * 
   * @param {string} event - The name of the event.
   * @param {...any} args - Arguments to be passed to the listener functions.
   */
  emit(event, ...args) {
    if (!this.events[event]) return;
    this.events[event].forEach(listener => listener(...args));
  }
  
  /**
   * Sets a value in the context state under the given key.
   * 
   * @param {string} key - The key under which the value should be stored.
   * @param {any} value - The value to store.
   * @returns {Object} The created state object for the value.
   */
  set(key, value) {
    let state = createState(value);
    this.data[key] = state;
    return state;
  }
  
  /**
   * Retrieves a value from the context state by the given key.
   * 
   * @param {string} key - The key of the value to retrieve.
   * @returns {any} The value stored under the given key.
   */
  get(key) {
    return this.data[key];
  }
}

/**
 * Creates context 
 * @module rumious
 * @param {string} [globalName=''] - The name of the global context.
 * @param {Object} [data={}] - The initial data to be stored in the context.
 * @returns {RumiousContext} The created or retrieved context instance.
 * @throws {string} If the initial data is not an object.
 */
export function createContext(globalName = '', data = {}) {
  if (!data || typeof data !== 'object') {
    throw 'Rumious context: Initial value must be object !';
  }
  if (!window.RUMIOUS_CONTEXTS[globalName]) window.RUMIOUS_CONTEXTS[globalName] = new RumiousContext(data);
  return window.RUMIOUS_CONTEXTS[globalName];
}