import { RumiousReactor } from './reactive.js';

const ROOT_STATE = Symbol('ROOT_STATE');
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
        value.setProperty(ROOT_STATE,this)
        return value && typeof value === 'object' ? new RumiousState(value, this.reactor).value : new RumiousState(value, this.reactor);
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

export function isState(obj){
  return obj instanceof RumiousState;
}