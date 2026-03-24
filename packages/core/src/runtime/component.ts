import { Component } from "../component/component.js";
import { flushQueue } from "../effect/index.js";
import { Context } from "./context.js";
import { $$insertInRange, type RenderRange } from "./range.js";
import type { Renderer } from "./renderer.js";

export type ComponentFunc<T> = (props: T, ins: Component) => Renderer;
export function $$createComponent<T>(
  range: RenderRange,
  parentCtx: Context,
  component: ComponentFunc<T>,
  props: T,
) {
  let instance = new Component(parentCtx);
  let renderer = component(props, instance);

  $$insertInRange(range, renderer.render(instance.ctx), instance.ctx);

  const defs = instance.ctx.deferrers;
  for (let i = 0; i < defs.length; i++) {
    defs[i]?.();
  }
  instance.ctx.deferrers = [];
  flushQueue();
}
