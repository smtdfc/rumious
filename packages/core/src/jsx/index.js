import { isComponent } from '../component/component.js';
import {RumiousElement,RumiousElementList} from '../dom/element.js';
import {registerDirective} from '../render/directives.js';



export function createDirective(type,name,value) {
  return registerDirective(type,name,value);
}

export function createElement(type, props, ...children) {
  if (isComponent(type)) {
    return createComponent(type, props, children);
  }

  if (type === createFragment) {
    return createFragment(...children);
  }

  return new RumiousElement(type, props || {}, normalizeChildren(children));
}

export function createTextElement(text) {
  return new RumiousElement('TEXT_ELEMENT', { nodeValue: text }, []);
}

export function createComponent(type, props, children) {
  let component = new RumiousElement('COMPONENT', { ...props },new RumiousElementList(normalizeChildren(children)));
  component.component = type;
  return component;
}

function createFragment(...children) {
  return new RumiousElement('FRAGMENT', {}, normalizeChildren(children));
}

function normalizeChildren(children) {
  return children.map(child => (typeof child === 'object' ? child : createTextElement(child)));
}

window.RUMIOUS_JSX_SUPPORT = {
  createElement,
  createFragment,
  createDirective
};