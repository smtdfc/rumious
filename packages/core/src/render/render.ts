import { RumiousRenderContext } from "./context.js"
import { RumiousRenderTemplate } from "./template.js"


export function render(context: RumiousRenderContext, template: RumiousRenderTemplate, target: HTMLElement | HTMLDocument): void {
  let generator= template.generator;
  let root = generator(target,context);
}