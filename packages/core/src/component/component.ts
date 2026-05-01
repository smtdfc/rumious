import type { EffectFunc } from "../effect/index.js";
import { Context, TARGET_SYMBOL, type Target } from "../runtime/context.js";
import { createEffect } from "../runtime/effect.js";
import { $$createRenderer, Renderer } from "../runtime/renderer.js";
import type { State } from "../state/state.js";

export class Component implements Target {
  private ctx: Context;

  constructor(parent: Context) {
    this.ctx = new Context(parent);

    if (parent) {
      parent.childrens.push(this);
    }
  }

  [TARGET_SYMBOL]: () => Context = () => this.ctx;

  clean() {
    this.ctx.clean();
  }

  effect(fn: EffectFunc, deps: State<any>[]) {
    createEffect(fn, deps, this.ctx);
  }

  cleanup(fn: () => void) {
    this.ctx.cleanups.push(fn);
  }
}

export type FunctionComponent<T> = (
  props: T,
  ins?: Component,
  ctx?: Context,
) => Renderer;

export function Fragment(props: any, l: Component) {
  return $$createRenderer(() => {
    throw new Error(
      "Fragment placeholder reached runtime. Ensure Rumious compiler is enabled for this file.",
    );
  });
}

export type ForData<T> = T[] | State<T[]>;
export type ForTemplateProps<T> = { data: State<T>; index: number };
export type ForProps<T> = {
  data: ForData<T>;
  template: FunctionComponent<ForTemplateProps<T>>;
  keyer?: (item: T, index: number) => any;
};

export type IfProps = {
  condition: boolean | State<boolean> | (() => boolean);
  child: FunctionComponent<any>;
  fallback?: FunctionComponent<any>;
};

export function For<T>(props: ForProps<T>, l: Component) {
  return $$createRenderer(() => {
    throw new Error(
      "For placeholder reached runtime. Ensure Rumious compiler is enabled for this file.",
    );
  });
}

export function If(props: IfProps, l: Component) {
  return $$createRenderer(() => {
    throw new Error(
      "If placeholder reached runtime. Ensure Rumious compiler is enabled for this file.",
    );
  });
}
