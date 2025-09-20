import type { ComponentConstructor, State } from '@rumious/core';

export type RouteSlot = State<HTMLElement | null>;
export type RouteData = {
  params: State<Record<string, string>>;
  query: URLSearchParams | null;
};

export interface RouteProps {
  routeSlot: RouteSlot | null;
  routeData: RouteData;
}

export type RouteComponent = ComponentConstructor<RouteProps>;
export interface RouterModuleOption {
  strategy: 'hash' | 'history' | 'memory';
}

export type LoaderFunction =
  | (() => Promise<RouteComponent>)
  | (() => RouteComponent);

export interface RouteComponentLoader {
  type: 'loader';
  loader: LoaderFunction;
}

export interface RouteConfig {
  path: string;
  component?: RouteComponent | RouteComponentLoader;
  layout?: RouteComponent | RouteComponentLoader;
  childs?: RouteConfig[];
}
