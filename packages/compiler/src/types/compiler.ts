import type { Expression } from "@babel/types";

export type CompileOptions = {
  strictMode: boolean;
  filename: string;
  sourceMapFile: string;
};

export type AttributePart = {
  type: "attr";
  expr: Expression;
  path: string;
  name: string;
  deps: Expression[];
};

export type ExpressionPart = {
  type: "expr";
  expr: Expression;
  path: string;
  deps: Expression[];
};

export type ComponentPart = {
  type: "component";
  expr: Expression;
  path: string;
  props: Record<string, Expression>;
};

export type ForPart = {
  type: "for";
  path: string;
  template: Expression;
  data: Expression;
  key: Expression;
  other: Expression;
};

export type EventPart = {
  type: "event";
  name: string;
  path: string;
  isCapture: boolean;
  handler: Expression;
};

export type Part =
  | EventPart
  | AttributePart
  | ExpressionPart
  | ComponentPart
  | ForPart;
