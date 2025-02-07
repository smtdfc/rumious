import { RumiousReactor } from './reactive.js';
import { RumiousReducer } from './reducer.js';
import { produceState } from './produce.js';

export class RumiousState {
  constructor(target, reactor = null) {
    this.value = target;
    this.reactor = reactor ?? new RumiousReactor(this, []);
  }

  produce(recipe) {
    return produceState(this, recipe);
  }


  reducer(...args) {
    let computedObj;
    if (args.length === 1) {
      computedObj = new RumiousReducer(this, "", args[0]);
    } else {
      computedObj = new RumiousReducer(this, args[0], args[1]);
    }
    return computedObj.trigger.bind(computedObj);
  }

  setObjectByPath(path = "", value) {
    if (path.length == 0) {
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

  set(...args) {
    if (args.length === 1) {
      this.value = args[0];
    } else {
      let path = args[0];
      let value = args[1];
      this.setObjectByPath(path, value);
    }

    this.reactor.react();
  }

  get() {
    return this.value;
  }
}

export function createState(value) {
  return new RumiousState(value);
}

export function isState(obj) {
  return obj instanceof RumiousState;
}