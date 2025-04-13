import type { RumiousRenderContext } from "./context.js";
import {extractName} from "../utils/name.js";

function eventBindingDirective(context: RumiousRenderContext, target: HTMLElement, modifier: string, data: any): void {
  if(typeof data === "string"){
    data = context.findName(extractName(data));
  }
  
  target.addEventListener(modifier,data);
}

export const directives: Record < string, Function > = {
  "on": eventBindingDirective
}