import { RumiousRenderContext } from './context.js';
import { RumiousDymanicInjector } from './injector.js';
import { RumiousElementRef } from '../ref/element.js';
import { extractName } from '../utils/name.js';
import { RumiousState } from '../state/state.js';

function eventBindingDirective(
  context: RumiousRenderContext,
  target: HTMLElement,
  modifier: string,
  data: any
): void {
  if (typeof data === 'string') {
    data = context.findName(extractName(data));
  }

  target.addEventListener(modifier, data);
}

function refBindingDirective(
  context: RumiousRenderContext,
  target: HTMLElement,
  modifier: string,
  data: any
): void {
  if (typeof data === 'string') {
    data = context.findName(extractName(data));
  }

  if (data instanceof RumiousElementRef) {
    data.target = target;
  } else {
    throw Error('Rumious: ref directive required RumiousElementRef !');
  }
}

function injectDirective(
  context: RumiousRenderContext,
  target: HTMLElement,
  modifier: string,
  data: any
): void {
  if (typeof data === 'string') {
    data = context.findName(extractName(data));
  }

  if (data instanceof RumiousDymanicInjector) {
    data.addTarget(target);
    data.inject(target);
  } else {
    throw Error('Rumious: inject directive required RumiousInjector !');
  }
}

function bindDirective(
  context: RumiousRenderContext,
  target: HTMLElement,
  modifier: string,
  data: any
): void {
  if (typeof data === 'string') {
    data = context.findName(extractName(data));
  }

  if (data instanceof RumiousState) {
    target.setAttribute(modifier, data.value);
    data.reactor.addBinding(({}) => {
      target.setAttribute(modifier, data.value);
    });
  } else {
    throw Error('Rumious: bind directive required RumiousState !');
  }
}

function modelDirective(
  context: RumiousRenderContext,
  target: HTMLElement,
  modifier: string,
  data: any
): void {
  if (typeof data === 'string') {
    data = context.findName(extractName(data));
  }

  if (
    data instanceof RumiousState &&
    (target instanceof HTMLInputElement ||
      target instanceof HTMLSelectElement ||
      target instanceof HTMLTextAreaElement)
  ) {
    const type = (target as HTMLInputElement).type;

    target.addEventListener('input', () => {
      if (target instanceof HTMLInputElement) {
        switch (type) {
          case 'checkbox':
            data.set(target.checked);
            break;
          case 'radio':
            if (target.checked) data.set(target.value);
            break;
          default:
            data.set(target.value);
        }
      } else if (
        target instanceof HTMLSelectElement ||
        target instanceof HTMLTextAreaElement
      ) {
        data.set(target.value);
      }
    });
  } else {
    throw Error(
      'Rumious: model directive requires RumiousState and a valid form element!'
    );
  }
}

export const directives: Record<string, Function> = {
  on: eventBindingDirective,
  ref: refBindingDirective,
  inject: injectDirective,
  bind: bindDirective,
  model: modelDirective,
};
