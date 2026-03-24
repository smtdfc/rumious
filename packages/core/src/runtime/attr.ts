import { State } from "../state/state.js";
import type { Context } from "./context.js";
import { $$effect } from "./effect.js";

export function $$attr(
  element: HTMLElement,
  name: string,
  parentCtx: Context,
  exprFn: () => any,
  deps: State<any>[] = [],
) {
  $$effect(
    () => {
      const value = exprFn();
      element.setAttribute(name, value);
    },
    deps,
    parentCtx,
  );
}
