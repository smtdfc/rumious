export type RumiousRouterEventHandler = (data?: any) => void;

export type RumiousRouterEvents =
  | 'page_loaded'
  | 'not_found'
  | 'not_allow'
  | 'error'
  | 'redirect'
  | 'page_start_load';

export class RumiousRouterEvent {
  public events: Record<RumiousRouterEvents, RumiousRouterEventHandler[]>;
  constructor() {
    this.events = {
      page_loaded: [],
      not_found: [],
      not_allow: [],
      error: [],
      redirect: [],
      page_start_load: [],
    };
  }

  on(name: RumiousRouterEvents, callback: RumiousRouterEventHandler): void {
    if (!this.events[name]) this.events[name] = [];
    this.events[name].push(callback);
  }

  emit(name: RumiousRouterEvents, data?: any): void {
    if (!this.events[name]) return;
    this.events[name].forEach((callback) => callback(data));
  }

  off(name: RumiousRouterEvents, callback: RumiousRouterEventHandler): void {
    if (!this.events[name]) return;
    this.events[name] = this.events[name].filter((c) => c !== callback);
  }
}
