import { isFunction } from '../utils/checker.js';

export class RumiousDirective {
  constructor(type, name, value) {
    this.type = type;
    this.name = name;
    this.value = value;
  }

  init() {
    console.warn("Directive haven't handler !");
  }
}

export class RumiousEventBindingDirective extends RumiousDirective {
  init(dom, renderContext) {
    let fn = null;

    const getHandler = (value) => {
      if (!renderContext.find(value)) {
        console.warn(`Missing event handler for event: ${this.name}`);
        return null;
      }
      const handler = renderContext.get(value);
      if (!isFunction(handler)) {
        throw `${value} is not a function!`;
      }
      return handler.bind(renderContext.target);
    };

    if (this.value.type === "string") {
      fn = getHandler(this.value.value);
    } else if (this.value.type === "expression") {
      fn = this.value.value;
      if (!isFunction(fn)) {
        throw "Event handler requires a function!";
      }
    } else if (this.value.type === "dynamic_value") {
      fn = getHandler(this.value.value.objectName);
    }

    if (fn) {
      dom.addEventListener(this.name, fn);
    }
  }
}


const directives = {
  on(event, value) {
    return new RumiousEventBindingDirective("on", event, value);
  },
  "bind": null
};


export function registerDirective(type, name, value) {
  return directives[type]?.(name, value);
}