export class RumiousReactor {
  constructor(target = null, bindings = []) {
    this.target = target;
    this.bindings = bindings;
  }

  react() {
    this.bindings.forEach((callback) => callback());
  }

  addBinding(fn) {
    this.bindings.push(fn);
  }
}