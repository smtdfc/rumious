import type {RumiousRouterModule} from "./router.js"
import type {RumiousState} from "rumious"
import type {RumiousRouterRouteMatchResult} from "./types.js"

export interface RumiousRouterPageProps{
  router:RumiousRouterModule,
  routeSlot:RumiousState<HTMLElement>,
  route:RumiousRouterRouteMatchResult
}