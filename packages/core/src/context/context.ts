import { generateName } from "../utils/name.js";

window.RUMIOUS_CONTEXTS = {};

export class RumiousContext < T extends object > {
  public events: Record < string,Function[] > ;
  public values: Partial < T > ;
  
  constructor(initialValues: Partial < T > = {}) {
    this.events = {};
    this.values = initialValues;
  }
  
  has < K extends keyof T > (key: K): boolean {
    return key in this.values;
  }
  
  set < K extends keyof T > (key: K, value: T[K]): void {
    this.values[key] = value;
  }
  
  get < K extends keyof T > (key: K): T[K] | undefined {
    return this.values[key];
  }
  
  on(event: string, callback: Function): void {
    if (!this.events[event]) this.events[event] = [];
    this.events[event].push(callback);
  }
  
  off(event: string, callback: Function): void {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(fn => fn !== callback);
  }
  
  emit(event: string, payload: any): void {
    if (!this.events[event]) return;
    this.events[event].forEach(fn => fn(payload));
  }
}


export function createContext < T extends object > (values: T, name: string = generateName("rctx_")): RumiousContext < T > {
  if (window.RUMIOUS_CONTEXTS[name]) return window.RUMIOUS_CONTEXTS[name] as RumiousContext < T > ;
  else {
    let context = new RumiousContext < T > (values);
    window.RUMIOUS_CONTEXTS[name] = context;
    return context;
  }
}