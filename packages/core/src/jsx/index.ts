import { RumiousTemplateGenerator } from '../types/render.js';
import { RumiousRenderTemplate } from '../render/template.js';
import {
  RumiousComponentConstructor,
  RumiousComponentElement,
} from '../component/element.js';
import { RumiousRenderContext } from '../render/context.js';
import { directives } from '../render/directives.js';
import { dynamicValue as dynamicValueReg } from '../render/dynamic.js';

export function template(
  generator: RumiousTemplateGenerator
): RumiousRenderTemplate {
  return new RumiousRenderTemplate(generator);
}

function addDirective(
  element: HTMLElement,
  context: RumiousRenderContext,
  name: string,
  modifier: string = '',
  data: any
): void {
  let callback = directives[name];
  if (callback) {
    callback(context, element, modifier, data);
  } else {
    throw Error('Rumious: Cannot solve directive !');
  }
}

function dynamicValue(
  target: HTMLElement,
  textNode: Text,
  value: any,
  context: RumiousRenderContext
): void {
  dynamicValueReg(target, textNode, value, context);
}

function createComponent(
  componentConstructor: RumiousComponentConstructor
): HTMLElement {
  let tagName = componentConstructor.tagName as string;
  if (!window.customElements.get(tagName)) {
    window.customElements.define(
      tagName,
      class extends RumiousComponentElement {
        public static tag = tagName;
      }
    );
  }

  return document.createElement(tagName);
}

// This is just to satisfy TypeScript's JSX requirement.
// Rumious doesn't use createElement — we do things differently.

function createElement(...args: any[]): any {
  console.log(args);
  throw Error(`Rumious doesn't use createElement !`);
}

export const Fragment = function(...args: any[]): any {
  throw Error(`Fragment element must be compiled by Rumious !`);
};

window.RUMIOUS_JSX = {
  template,
  createElement,
  addDirective,
  dynamicValue,
  createComponent,
};
