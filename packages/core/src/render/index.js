import { isCamelCase, isPrimitive } from '../utils/checker.js';
import { renderComponent } from '../component/render.js';
import { RumiousDirective } from './directives.js';
import { createTextElement } from '../jsx/index.js';
import { RumiousElement } from '../dom/element.js';
import { RumiousDymanicInjector } from './injector.js';

function setElementProps(dom, props, renderContext) {
  for (const [name, propValue] of Object.entries(props || {})) {
    if (propValue instanceof RumiousDirective) {
      propValue.init(dom, renderContext);
    } else if (name.startsWith('on') && isCamelCase(name)) {
      dom.addEventListener(name.substring(2).toLowerCase(), propValue);
    } else {
      dom.setAttribute(name, propValue);
    }
  }
}

function handleComponentElement(element, container, render, renderContext) {
  const dom = renderComponent(element.component, element.props, element.children, render, renderContext);
  container.appendChild(dom);
  return container;
}

function handleTextElement(element) {
  return document.createTextNode(element.props.nodeValue);
}

function handleRegularElement(element, renderContext) {
  const dom = document.createElement(element.type);
  setElementProps(dom, element.props, renderContext);
  
  for (const child of element.children) {
    render(child, dom, renderContext);
  }
  
  return dom;
}

export function render(element, container, renderContext = {}) {
  if (!element) return container;
  
  if (isPrimitive(element)) {
    return render(createTextElement(element), container, renderContext);
  }
  
  if (Array.isArray(element)) {
    for (const item of element) {
      render(item, container, renderContext);
    }
    return container;
  }
  
  if (element instanceof RumiousElement) {
    let dom;
    
    switch (element.type) {
      case 'COMPONENT':
        return handleComponentElement(element, container, render, renderContext);
      case 'FRAGMENT':
      case 'ELEMENT_LIST':
        for (const child of element.children) {
          render(child, container, renderContext);
        }
        return container;
      case 'TEXT_ELEMENT':
        dom = handleTextElement(element);
        break;
     default:
        dom = handleRegularElement(element, renderContext);
    }
    
    container.appendChild(dom);
    return container;
  }
  
  if (element instanceof HTMLElement) {
    container.appendChild(element);
    return container;
  }
  
  if (element instanceof RumiousDymanicInjector) {
    if (container instanceof HTMLDocument) {
      throw 'Rumious Render: Unsupported inject content in HTMLDocument!';
    }
    
    element.setTarget(container,render,renderContext);
    element.inject(true);
    return container;
  }
  
  return render(createTextElement(JSON.stringify(element)), container, renderContext);
}

export * from './injector.js';