import { RumiousRenderContext } from "./context.js";
import { RumiousDymanicInjector } from "./injector.js";
import { RumiousElementRef } from '../ref/element.js';
import { extractName } from "../utils/name.js";

function eventBindingDirective(context: RumiousRenderContext, target: HTMLElement, modifier: string, data: any): void {
  if (typeof data === "string") {
    data = context.findName(extractName(data));
  }
  
  target.addEventListener(modifier, data);
}

function refBindingDirective(context: RumiousRenderContext, target: HTMLElement, modifier: string, data: any): void {
  if (typeof data === "string") {
    data = context.findName(extractName(data));
  }
  
  if (data instanceof RumiousElementRef) {
    data.target = target;
  } else {
    throw Error("Rumious: ref directive required RumiousElementRef !");
  }
}

function injectDirective(context: RumiousRenderContext, target: HTMLElement, modifier: string, data: any): void {
  if (typeof data === "string") {
    data = context.findName(extractName(data));
  }
  
  if (data instanceof RumiousDymanicInjector) {
    data.addTarget(target);
    data.inject(target);
  } else {
    throw Error("Rumious: inject directive required RumiousInjector !");
  }
}

export const directives: Record < string, Function > = {
  "on": eventBindingDirective,
  "ref": eventBindingDirective,
  "inject":injectDirective,
}