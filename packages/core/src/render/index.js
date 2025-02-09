import { isCamelCase } from '../utils/checker.js';
import { renderComponent } from '../component/render.js';
import { RumiousDirective } from './directives.js';

function handleComponentElement(element, container, render,renderContext) {
  const dom = renderComponent(element.component, element.props, element.children, render);
  Object.entries(element.props || {}).forEach(([, propValue]) => {
    if (propValue instanceof RumiousDirective) {
      handleDirective(dom, propValue, renderContext,'component');
    }
    
  });
  container.appendChild(dom);
  return container;
}

function handleFragmentOrElementList(element, container, renderContext) {
  element.children.forEach(child => render(child, container, renderContext));
  return container;
}

function handleTextElement(element) {
  return document.createTextNode(element.props.nodeValue);
}

function handleRegularElement(element, renderContext) {
  const dom = document.createElement(element.type);
  Object.entries(element.props || {}).forEach(([name, propValue]) => {
    if (name.startsWith('on') && isCamelCase(name)) {
      dom.addEventListener(name.substring(2).toLowerCase(), propValue);
    } else {
      setElementProps(dom, name, propValue, renderContext);
    }
  });
  return dom;
}

function handleDirective(dom, directive, renderContext) {
  directive.init(dom, renderContext);
}

function setElementProps(dom, name, propValue, renderContext) {
  if (dom.nodeType === Node.TEXT_NODE) {
    dom.nodeValue = propValue;
  } else if (propValue instanceof RumiousDirective) {
    handleDirective(dom, propValue, renderContext, 'element');
  } else {
    dom.setAttribute(name, propValue);
  }
}

export function render(element, container, renderContext = {}) {
  if (!element) return container;

  let dom;

  if (element.type === 'COMPONENT') {
    return handleComponentElement(element, container, render,renderContext);
  }

  if (element.type === 'FRAGMENT' || element.type === 'ELEMENT_LIST') {
    return handleFragmentOrElementList(element, container, renderContext);
  }

  if (element.type === 'TEXT_ELEMENT') {
    dom = handleTextElement(element);
  } else {
    dom = handleRegularElement(element, renderContext);
  }

  element.children.forEach(child => render(child, dom, renderContext));
  container.appendChild(dom);
  return container;
}