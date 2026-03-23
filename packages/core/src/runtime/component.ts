import { Component } from "../component/component.js";
import { Context } from "./context.js";
import { $$insertInRange, type RenderRange } from "./range.js";
import type { Renderer } from "./renderer.js";

export function $$createComponent<T>(
  range: RenderRange,
  parentCtx: Context,
  component: (ins: Component, props: T) => Renderer,
  props: T,
) {
  let instance = new Component(parentCtx);
  let renderer = component(instance, props);

  $$insertInRange(range, renderer.render(instance.ctx), instance.ctx);

  const defs = instance.ctx.deferrers;
  for (let i = 0; i < defs.length; i++) {
    defs[i]();
  }
  instance.ctx.deferrers = [];
}
