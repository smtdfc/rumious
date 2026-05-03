import {
  createState,
  type Lazy,
  type Renderer,
  type State,
  Component,
  getContext,
  withCurrentContext,
  $$createRenderer,
} from "@rumious/core";
import type { Layout } from "./layout";
import type { Page } from "./page";
import { match } from "./matcher";
import { diffLayout } from "./layout";

export interface IRouteDeclaration {
  RouteLayouts: Record<string, Lazy<{ Layout: Layout }>>;
  RoutePages: Record<
    string,
    {
      component: Lazy<{ Page: Page }>;
      layouts: Array<string>;
    }
  >;
}

export type ResolvedRoute = {
  path: string;
  params: Record<string, any>;
  page: Page;
  layouts: Array<string>;
  renderer: Renderer;
};

export class Router {
  private currentLayouts: Array<string> = [];
  private currentParams: Record<string, any> = {};
  private currentRenderer: Renderer | null = null;
  private routeState = createState<ResolvedRoute | null>(null);
  private layoutOutlets = new Map<string, State<any>>();
  private declarations: IRouteDeclaration;
  constructor(decls: IRouteDeclaration) {
    this.declarations = decls;
  }

  get params() {
    return this.currentParams;
  }

  get route() {
    return this.routeState;
  }

  async resolve(path: string): Promise<ResolvedRoute | null> {
    for (const [routePath, pageDecl] of Object.entries(
      this.declarations.RoutePages,
    )) {
      const data = match(routePath, path);
      if (!data) {
        continue;
      }

      const layouts = pageDecl.layouts;
      const diffIndex =
        this.currentRenderer === null
          ? 0
          : diffLayout(this.currentLayouts, layouts);

      if (diffIndex !== -1) {
        for (
          let index = diffIndex;
          index < this.currentLayouts.length;
          index += 1
        ) {
          const layoutKey = this.currentLayouts[index];
          if (layoutKey !== undefined) {
            this.layoutOutlets.delete(layoutKey);
          }
        }
      }

      const pageModule = await pageDecl.component.value;
      const pageRenderer = this.mountAsRenderer(pageModule.Page.component, {
        router: this,
      });

      const renderer = await this.renderLayouts(
        layouts,
        pageRenderer,
        diffIndex,
      );

      this.currentLayouts = layouts.slice();
      this.currentParams = data.params;
      this.currentRenderer = renderer;

      this.routeState.set({
        path,
        params: data.params,
        page: pageModule.Page,
        layouts,
        renderer,
      });

      return {
        path,
        params: data.params,
        page: pageModule.Page,
        layouts,
        renderer,
      };
    }

    this.currentLayouts = [];
    this.currentParams = {};
    this.currentRenderer = null;
    this.routeState.set(null);
    return null;
  }

  private async renderLayouts(
    layouts: Array<string>,
    pageRenderer: Renderer,
    diffIndex: number,
  ): Promise<Renderer> {
    if (layouts.length === 0) {
      return pageRenderer;
    }

    const startIndex = diffIndex === -1 ? layouts.length : diffIndex;
    let renderer = pageRenderer;

    for (let index = layouts.length - 1; index >= startIndex; index -= 1) {
      const layoutKey = layouts[index]!;
      const layoutModule =
        await this.declarations.RouteLayouts[layoutKey]?.value;

      if (!layoutModule) {
        throw new Error(`Missing layout declaration for "${layoutKey}"`);
      }

      let outlet = this.layoutOutlets.get(layoutKey);
      if (!outlet) {
        outlet = createState<any>(renderer);
        this.layoutOutlets.set(layoutKey, outlet);
      } else {
        outlet.set(renderer);
      }
      renderer = this.mountAsRenderer(layoutModule.Layout.component, {
        router: this,
        outlet,
      });
    }

    if (startIndex === layouts.length) {
      const lastLayoutKey = layouts[layouts.length - 1];
      const lastOutlet = lastLayoutKey
        ? this.layoutOutlets.get(lastLayoutKey)
        : undefined;

      if (lastOutlet) {
        lastOutlet.set(pageRenderer);
      }

      return this.currentRenderer ?? renderer;
    }

    if (startIndex > 0) {
      const anchorLayoutKey = layouts[startIndex - 1];
      const anchorOutlet = anchorLayoutKey
        ? this.layoutOutlets.get(anchorLayoutKey)
        : undefined;

      if (anchorOutlet) {
        anchorOutlet.set(renderer);
      }

      return this.currentRenderer ?? renderer;
    }

    return renderer;
  }

  start() {
    const currentPath = window.location.pathname;
    void this.resolve(currentPath);

    window.addEventListener("popstate", () => {
      void this.resolve(window.location.pathname);
    });
  }

  private mountAsRenderer(
    componentFn: (props: any, ins?: any, ctx?: any) => Renderer,
    props: any,
  ): Renderer {
    // Execute the component function immediately inside a fresh Component
    // context so that `createEffect` and other APIs have a valid ctx.
    const instance = new Component(undefined as any);
    const branchCtx = getContext(instance);

    let renderer!: Renderer;
    withCurrentContext(branchCtx, () => {
      renderer = componentFn(props, instance, branchCtx);
    });

    // Render once to allow deferrers/effects to register.
    withCurrentContext(branchCtx, () => {
      renderer.render(branchCtx);
      const defs = branchCtx.deferrers;
      for (let i = 0; i < defs.length; i++) {
        defs[i]?.();
      }
      branchCtx.deferrers = [];
    });

    return renderer;
  }
}
