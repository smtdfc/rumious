import type { FunctionComponent } from "@rumious/core";
import type { Router } from "./router";

export type PageProps = {
  router: Router;
};

export type Page = {
  component: FunctionComponent<PageProps>;
};
