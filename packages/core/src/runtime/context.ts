import type { EffectFunc } from "../effect/index.js";

export class Context {
  public childrens: any[] = [];
  public deferrers: any[] = [];
  public cleanups: any[] = [];
  constructor(public parent?: Context) {}
  clean() {
    while (this.childrens.length > 0) {
      const child = this.childrens.pop();
      if (child && typeof child.clean === "function") {
        child.clean();
      }
    }

    while (this.cleanups.length > 0) {
      const cleanupFn = this.cleanups.pop();
      if (typeof cleanupFn === "function") {
        try {
          cleanupFn();
        } catch (e) {
          throw e;
        }
      }
    }

    this.deferrers = [];
  }
}
