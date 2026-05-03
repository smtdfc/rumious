import {
  $$createRenderer,
  $$createRange,
  $$insertInRange,
  createEffect,
} from "@rumious/core";
import type { State } from "@rumious/core";
import type { Renderer } from "@rumious/core";

export type OutletProps = {
  outlet: State<Renderer | DocumentFragment | Node | null>;
};

export function Outlet(props: OutletProps) {
  return $$createRenderer((ctx) => {
    const fragment = document.createDocumentFragment();
    const anchor = document.createElement("span");
    fragment.append(anchor);

    const range = $$createRange(anchor);

    createEffect(
      () => {
        const content = props.outlet.get() ?? document.createDocumentFragment();
        $$insertInRange(range, content as any, ctx);
      },
      [props.outlet],
      ctx,
    );

    return fragment;
  });
}
