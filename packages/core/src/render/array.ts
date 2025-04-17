import { RumiousRenderTemplate } from "./template.js";
import type { RumiousArrayState } from "../state/array.js";
import type { RumiousRenderContext } from "./context.js";

type RumiousDynamicArrayRenderFn < T > = (item: T, index: number) => RumiousRenderTemplate;

export class RumiousDynamicArrayRenderer < T > {
  public anchorElement!: HTMLElement;
  public context!: RumiousRenderContext;
  constructor(public state: RumiousArrayState < T > , public callback: RumiousDynamicArrayRenderFn < T > ) {}
  
  prepare(anchor: HTMLElement, context: RumiousRenderContext): void {
    this.anchorElement = anchor;
    this.context = context;
  }
  
  async render() {
    this.anchorElement.textContent = "";
    for (let [index, value] of this.state.value.entries()) {
      let template = await this.callback(value, index);
      let fragment = document.createDocumentFragment();
      this.context.renderHelper(this.context, template, fragment);
      this.anchorElement.appendChild(fragment);
    }
  }
  
}

export function renderDynamicArray < T > (state: RumiousArrayState < T > , callback: RumiousDynamicArrayRenderFn < T > ) {
  return new RumiousDynamicArrayRenderer < T > (state, callback);
}