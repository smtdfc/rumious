import { isCamelCase } from '../utils/checker.js';
import { renderComponent } from '../component/render.js';
import { isComponent } from '../component/component.js';

export function render(element, container, renderContext = {}) {
  if (!element) return container;

  let dom;

  if (element.type === "COMPONENT") {
    dom = renderComponent(element.props.component, element.props, element.children, render);
    container.appendChild(dom);
    return container;
  }

  if (element.type === "FRAGMENT" || element.type === "ELEMENT_LIST") {
    element.children.forEach(child => render(child, container, renderContext));
    return container;
  }

  if (element.type === "TEXT_ELEMENT") {
    dom = document.createTextNode(element.props.nodeValue);
  } else {
    dom = document.createElement(element.type);
  }

  Object.entries(element.props || {}).forEach(([name, value]) => {
    if (name === "ref") {
      renderContext.addRef?.(value);
    } else if (name.startsWith("on") && isCamelCase(name)) {
      dom.addEventListener(name.substring(2).toLowerCase(), value);
    } else if (dom.nodeType === Node.TEXT_NODE) {
      dom.nodeValue = value;
    } else {
      dom.setAttribute(name, value);
    }
  });

  element.children.forEach(child => render(child, dom, renderContext));
  container.appendChild(dom);
  return container;
}