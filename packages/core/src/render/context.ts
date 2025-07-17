import type { App } from '../app/index.js';

export type RenderHook = () => unknown;
export class RenderContext {
  public onRenderFinish: RenderHook[] = [];
  constructor(
    public app: App,

    public target: any,
  ) {}
}
