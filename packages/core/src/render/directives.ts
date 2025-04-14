import type { RumiousRenderContext } from "./context.js";
import {RumiousElementRef} from '../ref/element.js';
import {extractName} from "../utils/name.js";

function eventBindingDirective(context: RumiousRenderContext, target: HTMLElement, modifier: string, data: any): void {
  if(typeof data === "string"){
    data = context.findName(extractName(data));
  }
  
  target.addEventListener(modifier,data);
}

function refBindingDirective(context: RumiousRenderContext, target: HTMLElement, modifier: string, data: any): void {
  if (typeof data === "string") {
    data = context.findName(extractName(data));
  }
  
  if(data instanceof RumiousElementRef){
    data.target = target;
  }else{
    throw Error("Rumious: ref directive required RumiousElementRef !");
  }
}

export const directives: Record < string, Function > = {
  "on": eventBindingDirective,
"ref": eventBindingDirective,
}