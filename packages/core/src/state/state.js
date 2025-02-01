import { RumiousReactor } from './reactive.js';

export class RumiousState {
  constructor(target, reactor = null) {
    this.target = target;
    this.reactor = reactor ?? new RumiousReactor(this, []);
    if (target && typeof target === 'object') {
      this.wrapProxy(target)
    } else {
      this._value = target;
    }
  }

  wrapProxy(target) {
    this._value = new Proxy(target, {
      get: (target, prop) => {
        const value = target[prop];
        return value && typeof value === 'object' ? new RumiousState(value, this.reactor).value : value;
      },
      set: (target, prop, value) => {
        if (value && typeof value === 'object') {
          value = new RumiousState(value, this.reactor).proxy;
        }
        this.reactor.react();
        target[prop] = value;
        return true;
      }
    });
  }


  set value(val) {
    if (val && typeof val === "object") {
      this.wrapProxy(val);
    } else {
      this._value = val;
    }
    this.reactor.react();
  }

  get value() {
    return this._value;
  }
}

export function createState(value) {
  return new RumiousState(value);
}