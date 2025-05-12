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
    type ApplyMap = {
      [key: string]: (val: any, target: HTMLElement) => void;
    };

    const applyMap: ApplyMap = {
      text: (val, el) => (el.textContent = val),
      html: (val, el) => (el.innerHTML = val),
      value: (val, el) =>
        ((el as HTMLInputElement | HTMLTextAreaElement).value = val),
      class: (val, el) => (el.className = val),
      style: (val, el) => (el.style.cssText = val),
      checked: (val, el) => ((el as HTMLInputElement).checked = val),
      disabled: (val, el) => {
        if ('disabled' in el) {
          el.disabled = val;
        }
      },
      readonly: (val, el) =>
        ((el as HTMLInputElement | HTMLTextAreaElement).readOnly = val),
      required: (val, el) =>
        ((el as HTMLInputElement | HTMLSelectElement).required = val),
      selected: (val, el) => ((el as HTMLOptionElement).selected = val),
      src: (val, el) => ((el as HTMLImageElement | HTMLVideoElement).src = val),
      href: (val, el) => ((el as HTMLAnchorElement).href = val),
      placeholder: (val, el) =>
        ((el as HTMLInputElement | HTMLTextAreaElement).placeholder = val),
      title: (val, el) => (el.title = val),
      show: (val, el) => (el.style.display = val ? '' : 'none'),
      hide: (val, el) => (el.style.display = val ? 'none' : ''),
    };

    const apply =
      applyMap[modifier] ?? ((val, el) => el.setAttribute(modifier, val));
    apply(data.value, target);
    data.reactor.addBinding(() => apply(data.value, target));
  } else {
    throw Error('Rumious: bind directive requires RumiousState!');
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
