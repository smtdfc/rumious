import { State } from "../state/state.js";
import type { Context } from "./context.js";
import { $$effect } from "./effect.js";

export function $$event(
  element: HTMLElement,
  eventName: string,
  parentCtx: Context,
  handlerFn: () => (event: Event) => void,
  deps: State<any>[] = [],
) {
  let currentHandler: ((event: Event) => void) | null = null;

  $$effect(
    () => {
      const newHandler = handlerFn();

      if (currentHandler) {
        element.removeEventListener(eventName, currentHandler);
      }

      currentHandler = (event: Event) => {
        const actualTarget = event.currentTarget as HTMLElement;
        if (newHandler && typeof newHandler === "function") {
          newHandler.call(actualTarget, event);
        }
      };

      element.addEventListener(eventName, currentHandler);
    },
    deps,
    parentCtx,
  );

  return () => {
    if (currentHandler) {
      element.removeEventListener(eventName, currentHandler);
    }
  };
}
