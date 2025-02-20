import { isFunction } from '../utils/checker.js';

/**
 * Base class for Rumious directives.
 *  @module rumious
 */
export class RumiousDirective {
  /**
   * @constructor
   * @param {string} type - The type of the directive.
   * @param {string} name - The name of the directive.
   * @param {any} value - The value associated with the directive.
   */
  constructor(type, name, value) {
    this.type = type;
    this.name = name;
    this.value = value;
  }
  
  /**
   * Initializes the directive.
   * This method should be overridden in subclasses.
   */
  init() {
    console.warn("Directive haven't handler !");
  }
}

/**
 * Handles event binding directives.
 *  @module rumious
 */
export class RumiousEventBindingDirective extends RumiousDirective {
  /**
   * @param {HTMLElement} dom - The DOM element to bind the event to.
   * @param {object} renderContext - The context in which the directive is being rendered.
   */
  async init(dom, renderContext) {
    let fn = null;
    
    /**
     * Retrieves the event handler function from the render context.
     * @param {string} value - The name of the function in the render context.
     * @returns {Function|null} The bound function or null if not found.
     */
    const getHandler = (value) => {
      if (!renderContext.find(value)) {
        console.warn(`Missing event handler for event: ${this.name}`);
        return null;
      }
      const handler = renderContext.get(value);
      if (!isFunction(handler)) {
        throw new Error(`${value} is not a function!`);
      }
      return handler.bind(renderContext.target);
    };
    
    if (this.value.type === 'string') {
      fn = getHandler(this.value.value);
    } else if (this.value.type === 'expression') {
      fn = this.value.value;
      if (!isFunction(fn)) {
        throw new Error('Event handler requires a function!');
      }
    } else if (this.value.type === 'dynamic_value') {
      fn = getHandler(this.value.value.objectName);
    }
    
    if (fn) {
      dom.addEventListener(this.name, fn);
    }
  }
}

/**
 * Handles property binding directives.
 *  @module rumious
 */
export class RumiousPropsBindingDirective extends RumiousDirective {
  /**
   * @param {HTMLElement} dom - The DOM element to bind properties to.
   * @param {object} renderContext - The context in which the directive is being rendered.
   */
  async init(dom, renderContext) {
    if (this.value.type === 'expression') {
      let currentState = this.value.value;
      if (!currentState) {
        throw new Error('Invalid props value: Directive bind requires a RumiousState Object!');
      } else {
        currentState.reactor.addBinding(() => {
          let currentStateValue = currentState.get();
          this.bindAttr(dom, currentStateValue);
        });
        this.bindAttr(dom, currentState.get());
      }
    } else if (this.value.type === 'dynamic_value') {
      let currentStateValue = this.value.evaluator?.(renderContext.target);
      let currentState = renderContext.find(this.value.value.objectName);
      if (!currentState) {
        throw new Error('Invalid props value: Directive bind requires a RumiousState Object!');
      } else {
        currentState.reactor.addBinding(() => {
          let currentStateValue = this.value.evaluator?.(renderContext.target);
          this.bindAttr(dom, currentStateValue);
        });
      }
      
      this.bindAttr(dom, currentStateValue);
    }
  }
  
  /**
   * Normalizes the value for binding.
   * @param {any} value - The value to normalize.
   * @returns {string} Normalized string value.
   */
  normalizeValue(value) {
    if (typeof value === 'object') {
      return value.toString?.() ?? '';
    }
    return value;
  }
  
  /**
   * Binds the attribute to the DOM element.
   * @param {HTMLElement} dom - The DOM element to bind the attribute to.
   * @param {any} value - The value to bind.
   */
  async bindAttr(dom, value) {
    switch (this.name) {
      case 'html':
        dom.innerHTML = this.normalizeValue(value);
        break;
      case 'text':
        dom.textContent = this.normalizeValue(value);
        break;
      case 'show':
        dom.style.display = this.normalizeValue(value) ? 'block' : 'none';
        break;
      case 'hide':
        dom.style.display = this.normalizeValue(value) ? 'none' : 'block';
        break;
      case 'className':
        dom.className = this.normalizeValue(value);
        break;
      case 'style':
        Object.assign(dom.style, value);
        break;
      case 'disabled':
        dom.disabled = !!this.normalizeValue(value);
        break;
      case 'visible':
        dom.style.visibility = this.normalizeValue(value) ? 'visible' : 'hidden';
        break;
      default:
        dom.setAttribute(this.name, this.normalizeValue(value));
    }
  }
}

/**
 * Handles reference directives.
 *  @module rumious
 */
export class RumiousRefDirective extends RumiousDirective {
  /**
   * @param {HTMLElement} dom - The DOM element to assign the reference to.
   * @param {object} renderContext - The context in which the directive is being rendered.
   */
  async init(dom, renderContext) {
    if (this.value.type === 'expression') {
      let ref = this.value.value;
      if (!ref) {
        throw new Error('Invalid props value: Directive ref requires a RumiousRef Object!');
      } else {
        ref.set(dom);
      }
    } else if (this.value.type === 'dynamic_value') {
      let ref = renderContext.find(this.value.value.objectName);
      if (!ref) {
        throw new Error('Invalid props value: Directive ref requires a RumiousRef Object!');
      } else {
        ref.set(dom);
      }
    }
  }
}

/**
 * Handles children reference directives.
 * @module rumious
 */
export class RumiousChildrensRefDirective extends RumiousDirective {
  /**
   * @param {HTMLElement} dom - The DOM element whose children references are assigned.
   * @param {object} renderContext - The context in which the directive is being rendered.
   */
  async init(dom, renderContext) {
    if (this.value.type === 'expression') {
      let ref = this.value.value;
      if (!ref) {
        throw new Error('Invalid props value: Directive childsRef requires a RumiousChildRef Object!');
      } else {
        ref.set(dom);
      }
    } else if (this.value.type === 'dynamic_value') {
      let ref = renderContext.find(this.value.value.objectName);
      if (!ref) {
        throw new Error('Invalid props value: Directive childsRef requires a RumiousChildRef Object!');
      } else {
        ref.set(dom);
      }
    }
  }
}

/**
 * Directives registry.
 */
const directives = {
  /**
   * Creates an event binding directive.
   * @param {string} event - The event name.
   * @param {any} value - The event handler.
   * @returns {RumiousEventBindingDirective}
   */
  on(event, value) {
    return new RumiousEventBindingDirective('on', event, value);
  },
  
  /**
   * Creates a property binding directive.
   * @param {string} attr - The attribute name.
   * @param {any} value - The attribute value.
   * @returns {RumiousPropsBindingDirective}
   */
  bind(attr, value) {
    return new RumiousPropsBindingDirective('bind', attr, value);
  },
  
  /**
   * Creates a reference directive.
   * @param {any} _ - Unused parameter.
   * @param {any} value - The reference object.
   * @returns {RumiousRefDirective}
   */
  ref(_, value) {
    return new RumiousRefDirective('ref', _, value);
  },
  
  /**
   * Creates a children reference directive.
   * @param {any} _ - Unused parameter.
   * @param {any} value - The reference object.
   * @returns {RumiousChildrensRefDirective}
   */
  childsRef(_, value) {
    return new RumiousChildrensRefDirective('childsRef', _, value);
  }
};

/**
 * Registers a directive.
 * @module rumious
 * @param {string} type - The directive type.
 * @param {string} name - The directive name.
 * @param {any} value - The directive value.
 * @returns {RumiousDirective|undefined}
 */
export function registerDirective(type, name, value) {
  return directives[type]?.(name, value);
}