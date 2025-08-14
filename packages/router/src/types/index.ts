import type { ComponentConstructor, State } from '@rumious/core';

export type RouteSlot = State < HTMLElement | null > ;
export type RouteData ={
  params:State<object>;
  query:URLSearchParams | null;
}

export interface RouteProps {
  routeSlot:RouteSlot | null;
  routeData:RouteData;
}

export type RouteComponent = ComponentConstructor < RouteProps > ;
export interface RouterModuleOption {
  strategy: "hash"
}

export interface RouteComponentLoader {
  type:"loader";
  loader:() => ComponentConstructor < RouteProps >;
}

export interface RouteConfig{
  path:string;
  component?:RouteComponent | RouteComponentLoader ;
  layout?:RouteComponent | RouteComponentLoader;
  childs?: RouteConfig[];
}