import { describe, expect, it } from "vitest";

import { lazy, Renderer } from "@rumious/core";
import { Router, type IRouteDeclaration } from "../src/router";

const createRenderer = (label: string) =>
  new Renderer(() => {
    const fragment = document.createDocumentFragment();
    fragment.append(label);
    return fragment;
  });

describe("Router.resolve", () => {
  it("builds layouts and caches outlet state by layout key", async () => {
    const declarations: IRouteDeclaration = {
      RouteLayouts: {
        root: lazy(() => ({
          Layout: {
            component: ({ outlet }) => {
              expect(outlet.get()).toBeDefined();
              return createRenderer("root-layout");
            },
          },
        })),
        shell: lazy(() => ({
          Layout: {
            component: () => createRenderer("shell-layout"),
          },
        })),
      },
      RoutePages: {
        "/users/:id": {
          layouts: ["root", "shell"],
          component: lazy(() => ({
            Page: {
              component: () => createRenderer("page"),
            },
          })),
        },
      },
    };

    const router = new Router(declarations);

    const first = await router.resolve("/users/1");
    const firstRootOutlet = (router as any).layoutOutlets.get("root");
    const firstShellOutlet = (router as any).layoutOutlets.get("shell");

    const second = await router.resolve("/users/2");
    const secondRootOutlet = (router as any).layoutOutlets.get("root");
    const secondShellOutlet = (router as any).layoutOutlets.get("shell");

    expect(first?.params).toEqual({ id: "1" });
    expect(second?.params).toEqual({ id: "2" });
    expect(firstRootOutlet).toBe(secondRootOutlet);
    expect(firstShellOutlet).toBe(secondShellOutlet);
    expect(router.params).toEqual({ id: "2" });
  });
});
