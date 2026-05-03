import type { FunctionComponent, State } from "@rumious/core";
import type { Router } from "./router";

export function diffLayout(a: Array<string>, b: Array<string>): number {
  const maxLength = Math.max(a.length, b.length);

  for (let index = 0; index < maxLength; index += 1) {
    if (a[index] !== b[index]) {
      return index;
    }
  }

  return -1;
}

export type LayoutProps = {
  router: Router;
  outlet: State<any>;
};

export type Layout = {
  component: FunctionComponent<LayoutProps>;
};
