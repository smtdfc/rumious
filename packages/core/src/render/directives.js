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
  async init(dom, renderContext) {
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

export class RumiousPropsBindingDirective extends RumiousDirective {
  async init(dom, renderContext) {
    let fn = null;

    if (this.value.type === "expression") {

    } else if (this.value.type === "dynamic_value") {
      let currentStateValue = this.value.evaluator?.(renderContext.target)
      let currentState = renderContext.find(this.value.value.objectName);
      if (!currentState) {
        throw "Invalid props value: Directive bind: require a RumiousState Object !"
      } else {
        currentState.reactor.addBinding(() => {
          let currentStateValue = this.value.evaluator?.(renderContext.target)
          this.bindAttr(dom,currentStateValue);
        })
      }

      this.bindAttr(dom,currentStateValue);
    }
  }
  
  normalizeValue(value){
    if(typeof value === "object"){
      return value.toString?.() ?? ""
    }
    return value;
  }
  
  async bindAttr(dom,value) {
    switch(this.name){
      case "html":
        dom.innerHTML = this.normalizeValue(value);
        break;
      
      
    }
  }
}


const directives = {
  on(event, value) {
    return new RumiousEventBindingDirective("on", event, value);
  },
  bind(attr, value) {
    return new RumiousPropsBindingDirective("bind", attr, value);
  }
};


export function registerDirective(type, name, value) {
  return directives[type]?.(name, value);
}