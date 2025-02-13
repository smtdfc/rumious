export class RumiousRenderContext {
  constructor(target) {
    this.target = target;
    this.app = target.app;
    this.hooks = {
      onRendered: [],
      onBeforeRender: []
    };
  }

  find(name) {
    return this.target[name];
  }

  get(name) {
    return this.target[name];
  }

  addHook(type, callback) {
    if (this.hooks[type]) {
      this.hooks[type].push(callback);
    } else {
      throw new Error(`Hook type "${type}" is not defined !`);
    }
  }

  async runHooks(type, ...args) {
    if (this.hooks[type]) {
      for (const hook of this.hooks[type]) {
        await hook(...args);
      }
    }
  }
}