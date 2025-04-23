import type {
  RumiousComponentConstructor,
} from 'rumious';

import type {
  RumiousRouterModule,
} from './router.js';


export type RumiousRouterStrategies = "hash" | "history";
export type RumiousRouterRouteHandler = (router: RumiousRouterModule, slugs ? : Record < string, string > , query ? : URLSearchParams) => 
  RumiousComponentConstructor | Promise<RumiousComponentConstructor> ;

export type RumiousRouterRouteConfigs = {
  handler ? : RumiousRouterRouteHandler;
  protect ? : (router: RumiousRouterModule) => boolean;
}

export interface RumiousRouterLayourWrapperConfigs {}

export interface RumiousRouterConfigs {
  strategy: RumiousRouterStrategies,
  layoutsWrappers ? : Record < string,
  RumiousRouterLayourWrapperConfigs[] > ;
}

export interface RumiousRouterRouteMatchResult {
  isMatched: boolean,
  configs ? : RumiousRouterRouteConfigs,
  slugs ? : object,
  path: string
}