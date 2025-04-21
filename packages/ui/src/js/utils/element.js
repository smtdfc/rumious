export function createElement(type = 'span', classNames = '') {
  let element = document.createElement(type)
  element.className = classNames
  document.body.appendChild(element)
  return element
}
