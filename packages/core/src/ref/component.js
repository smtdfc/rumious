export class RumiousComponentRef {
  constructor(component) {
    this.target = component;
  }

  set(component) {
    this.target = component.forwardRefs;
  }
}

export function createComponentRef(component) {
  return new RumiousComponentRef(component);
}