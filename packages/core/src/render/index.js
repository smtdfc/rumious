import {isCamelCase} from '../utils/checker.js';
import {renderComponent} from '../component/render.js';
import {isComponent} from '../component/component.js';

export function render(element, container, renderContext = {}) {
  let dom;
  
  if(element.type === "COMPONENT"){
    dom = renderComponent(
      element.component,
      element.props ?? {},
      render
    )
    container.appendChild(dom)
    return container;
  }
  
  if (element.type === "FRAGMENT") {
    element.props.children.forEach(child => render(child, container, renderContext));
    return container;
  }

  dom =
    element.type === "TEXT_ELEMENT" ?
    document.createTextNode(element.props.nodeValue) :
    document.createElement(element.type);

  const isProperty = key => key !== "children";
  Object.keys(element.props ?? {})
    .filter(isProperty)
    .forEach(name => {
      if(name == "ref") renderContext.addRef(element.props[name]);
      else if(name.startsWith("on") && isCamelCase(name)){
        dom.addEventListener(name.substring(2),element.props[name]);
      }
      else{
        if(element.nodeType === Node.ELEMENT_NODE){
          dom.setAttribute(name,element.props[name]);
        }
        else dom[name] = element.props[name];
      }
    });

  if(element.props) element.props.children.forEach(child => render(child, dom, renderContext));
  container.appendChild(dom);

  return container;
}