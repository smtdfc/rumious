import { RumiousTemplateGenerator } from "../types/render.js";
import { RumiousRenderTemplate } from "../render/template.js";

export function template(generator: RumiousTemplateGenerator): RumiousRenderTemplate {
  return new RumiousRenderTemplate(generator);
}

// This is just to satisfy TypeScript's JSX requirement.
// Rumious doesn't use createElement — we do things differently.

function createElement(...args:any[]):any{
  throw Error("Rumious doesn't use createElement !");
}

window.RUMIOUS_JSX ={
  template,
  createElement
}