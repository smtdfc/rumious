import {createState } from '../state/state.js';

if (!window.RUMIOUS_CONTEXTS) {
  window.RUMIOUS_CONTEXTS = {};
}

export class RumiousContext {
  constructor(data = {}) {
    this.data = data;
    this.events = {};
  }

  on(event, listener) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);
  }

  off(event, listener) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(l => l !== listener);
  }

  emit(event, ...args) {
    if (!this.events[event]) return;
    this.events[event].forEach(listener => listener(...args));
  }

  set(key, value) {
    let state = createState(value);
    this.data[key] = state;
    return state;
  }

  get(key) {
    return this.data[key];
  }

}

export function createContext(globalName='',data={}){
  if(!window.RUMIOUS_CONTEXTS[globalName]) window.RUMIOUS_CONTEXTS[globalName] = new RumiousContext(data);
  return window.RUMIOUS_CONTEXTS[globalName];
}