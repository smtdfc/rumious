import type { ComponentConstructor, State } from '@rumious/core';

export interface RouterModuleOption {
  strategy: 'history' | 'hash' | 'memory';
}

export interface RouteComponentProps {
  routeSlot: State<unknown>;
  routeParams: State<Record<string, any>>;
}

export type WithRouteProps<ExtendedProps = {}> = RouteComponentProps &
  ExtendedProps;
export type RouteComponent<ExtendedProps = {}> = ComponentConstructor<
  WithRouteProps<ExtendedProps>
>;
export interface RouterModuleOption {}
export type RouteLayout =
  | RouteComponent<object>
  | (() => RouteComponent<object>);
export interface RouteConfig {
  component: RouteLayout;
  layout?: RouteLayout[];
}
export type RouteMap = Map<string, RouteConfig>;
