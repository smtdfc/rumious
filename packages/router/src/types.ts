import type { RumiousComponentConstructor } from 'rumious';

import type { RumiousRouterModule } from './router.js';

export type RumiousRouterStrategies = 'hash' | 'history';
export type RumiousRouterRouteHandler = (
  router: RumiousRouterModule,
  slugs?: Record<string, string>,
  query?: URLSearchParams
) => RumiousComponentConstructor | Promise<RumiousComponentConstructor>;

export type RumiousRouterLayout =
  | RumiousComponentConstructor
  | RumiousRouterRouteHandler;

export type RumiousRouterRouteConfigs = {
  handler?: RumiousRouterRouteHandler;
  layouts?: RumiousRouterLayout[];
  protect?: (router: RumiousRouterModule) => boolean;
};

export interface RumiousRouterConfigs {
  strategy: RumiousRouterStrategies;
}

export interface RumiousRouterRouteMatchResult {
  isMatched: boolean;
  configs?: RumiousRouterRouteConfigs;
  slugs?: Record<string, string>;
  path: string;
}
