import { State } from "../state/state.js";
import type { Context } from "./context.js";
import { $$effect } from "./effect.js";
import { $$insertInRange, type RenderRange } from "./range.js";

export function $$text(
  range: RenderRange,
  parentCtx: Context,
  expr: any,
  deps: State<any>[] = [],
) {
  const localDeps = expr instanceof State ? deps.concat(expr) : deps;

  $$effect(
    () => {
      const value = expr instanceof State ? expr.get() : expr;
      $$insertInRange(range, value ?? "", parentCtx);
    },
    localDeps,
    parentCtx,
  );
}
