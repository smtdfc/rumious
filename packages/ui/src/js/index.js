export * from "./components/index.js";
export * from "./events.js"



export function toggle(component, element, options = {}) {
  return component.generator(element, options).toggle();
}