import { RumiousRenderContext } from "./context.js"
import { RumiousRenderTemplate } from "./template.js"


export function render(context: RumiousRenderContext, template: RumiousRenderTemplate, target: HTMLElement | HTMLDocument | DocumentFragment): void {
  let generator= template.generator.bind(context.target);
  context.renderHelper = render;
  let root = generator(target,context);
}