export class RumiousReactor {
  constructor(target = null, bindings = []) {
    this.target = target;
    this.bindings = bindings;
  }

  react() {
    this.bindings.forEach((callback) => callback());
  }

  removeBinding(fn) {
    for (let i = this.bindings.length - 1; i >= 0; i--) {
      if (this.bindings[i] === fn) {
        this.bindings.splice(i, 1);
      }
    }
  }

  addBinding(fn) {
    this.bindings.push(fn);
  }
}