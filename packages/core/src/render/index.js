export function render(element, container, renderContext = {}) {
  let dom;

  if (element.type === "FRAGMENT") {
    element.props.children.forEach(child => render(child, container, renderContext));
    return container;
  }

  dom =
    element.type === "TEXT_ELEMENT" ?
    document.createTextNode(element.props.nodeValue) :
    document.createElement(element.type);

  const isProperty = key => key !== "children";
  Object.keys(element.props)
    .filter(isProperty)
    .forEach(name => {
      dom[name] = element.props[name];
    });

  element.props.children.forEach(child => render(child, dom, renderContext));
  container.appendChild(dom);

  return container;
}