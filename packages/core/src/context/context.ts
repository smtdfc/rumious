export class RumiousContext < T extends {} > {
  public events: Record < string,
  Set < (...args: any[]) => void >> = {};
  
  constructor(public values: T) {}
  
  set < K extends keyof T > (key: K, value: T[K]): void {
    this.values[key] = value;
  }
  
  get < K extends keyof T > (key: K): T[K] {
    return this.values[key];
  }
  
  emit(event: string, ...args: any[]): void {
    const listeners = this.events[event];
    if (listeners) {
      for (const fn of listeners) {
        fn(...args);
      }
    }
  }
  
  on(event: string, fn: (...args: any[]) => void): void {
    if (!this.events[event]) {
      this.events[event] = new Set();
    }
    this.events[event] !.add(fn);
  }
  
  off(event: string, fn ? : (...args: any[]) => void): void {
    if (!this.events[event]) return;
    
    if (fn) {
      this.events[event].delete(fn);
    } else {
      delete this.events[event];
    }
  }
}

export function createContext<T extends {}>(values:T):RumiousContext<T>{
  return new RumiousContext<T>(values);
}