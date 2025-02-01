import { isComponent } from '../component/component.js';
import {RumiousElement,RumiousElementList} from '../dom/element.js';


function createElement(type, props, ...children) {
  if (isComponent(type)) {
    return createComponent(type, props, children);
  }

  if (type === createFragment) {
    return createFragment(...children);
  }

  return new RumiousElement(type, props || {}, normalizeChildren(children));
}

function createTextElement(text) {
  return new RumiousElement("TEXT_ELEMENT", { nodeValue: text }, []);
}

function createComponent(type, props, children) {
  return new RumiousElement("COMPONENT", { component: type, ...props },new RumiousElementList(normalizeChildren(children)));
}

function createFragment(...children) {
  return new RumiousElement("FRAGMENT", {}, normalizeChildren(children));
}

function normalizeChildren(children) {
  return children.map(child => (typeof child === "object" ? child : createTextElement(child)));
}

window.RUMIOUS_JSX_SUPPORT = {
  createElement,
  createFragment,
};