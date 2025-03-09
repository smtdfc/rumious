export function toggle(component, element, options = {}) {
  return component.generator(element, options).toggle();
}