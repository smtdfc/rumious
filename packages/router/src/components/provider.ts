import { $$createRange, $$createRenderer, $$insertInRange, createEffect } from "@rumious/core";
import type { Router } from "../router/router";

export function RouteProvider({ router }: { router: Router }) {
  return $$createRenderer((ctx) => {
    const fragment = document.createDocumentFragment();
    const anchor = document.createElement("span");
    fragment.append(anchor);

    const outlet = $$createRange(anchor);

    createEffect(
      () => {
        const resolved = router.route.get();
        const content = resolved?.renderer ?? document.createDocumentFragment();
        $$insertInRange(outlet, content, ctx);
      },
      [router.route],
      ctx,
    );

    return fragment;
  });
}
