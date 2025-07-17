import { EVENT_DELEGATE_SYMBOL } from '@rumious/core';

declare global {
  interface HTMLElement {
    [EVENT_DELEGATE_SYMBOL]?: Record<string, Function>;
  }
}
