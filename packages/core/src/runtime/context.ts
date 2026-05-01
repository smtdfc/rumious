type Cleanable = {
  clean: () => void;
};

export const TARGET_SYMBOL = Symbol("target");

let currentContext: Context | null = null;

export interface Target {
  [TARGET_SYMBOL]: () => Context;
}

export function getContext(target: Target): Context {
  return target[TARGET_SYMBOL]();
}

export function getCurrentContext() {
  return currentContext;
}

export function withCurrentContext<T>(ctx: Context, fn: () => T): T {
  const previous = currentContext;
  currentContext = ctx;

  try {
    return fn();
  } finally {
    currentContext = previous;
  }
}

export class Context {
  public childrens: Cleanable[] = [];
  public deferrers: (() => void)[] = [];
  public cleanups: (() => void)[] = [];

  constructor(public parent?: Context) {}

  clean() {
    while (this.childrens.length > 0) {
      this.childrens.pop()!.clean();
    }

    while (this.cleanups.length > 0) {
      this.cleanups.pop()!();
    }

    this.deferrers.length = 0;
  }
}
