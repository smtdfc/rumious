import { State } from "./state";
import { scheduleEffect } from "./scheduler.js";

export type CleanupFunction = () => void;
export type EffectFunction = () => void | CleanupFunction;

export class Effect {
  private cleanup?: CleanupFunction;
  private lastDeps: any[];

  constructor(
    public cb: EffectFunction,
    public deps: any[] = [],
  ) {
    this.lastDeps = [...deps];

    for (let i = 0; i < deps.length; i++) {
      const dep = deps[i];

      if (dep === undefined) {
        throw new Error("Effect dependencies cannot contain undefined values.");
      }

      if (dep instanceof State) {
        dep.subscribe(() => scheduleEffect(this));
      }
    }

    // this.run(); // Effect only triggered on connectedCallback, not on creation
  }

  public run() {
    this.dispose();
    const result = this.cb();
    if (typeof result === "function") {
      this.cleanup = result;
    }
  }

  public update(newDeps: any[]) {
    const isChanged =
      newDeps.length !== this.lastDeps.length ||
      newDeps.some((dep, i) => dep !== this.lastDeps[i]);

    if (isChanged) {
      this.lastDeps = [...newDeps];
      scheduleEffect(this);
    }
  }

  public dispose() {
    if (this.cleanup) {
      this.cleanup();
      this.cleanup = undefined;
    }

    const deps = this.deps;
    const len = deps.length;

    for (let i = 0; i < len; i++) {
      const dep = deps[i];
      if (dep instanceof State) {
        dep.unsubscribe(this.run);
      }
    }
  }
}
