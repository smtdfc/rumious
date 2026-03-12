import { Context, Renderer, type RendererFn } from "../runtime";

export class App {
  private context = new Context();

  constructor(public root: HTMLElement) {}

  attach(renderer: Renderer) {
    this.context.clean();
    let frag = renderer.render(this.context);
    this.root.appendChild(frag);
  }
}

export function createApp(root: HTMLElement) {
  return new App(root);
}
