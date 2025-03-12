export function toggle(component, element, options = []) {
  return component.generator(element, options).action({
    type: 'toggle',
    trigger: element,
    target:element,
    component,
    options
  });
}

export function active(component, element, options = []) {
  return component.generator(element, options).action({
    type: 'active',
    trigger: element,
    component,
    target:element,
    options
  });
}