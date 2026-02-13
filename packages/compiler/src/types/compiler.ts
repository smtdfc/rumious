import type { Expression } from "@babel/types";

export type CompileOptions = {
  strictMode: boolean;
  filename: string;
  sourceMapFile: string;
};

export type DynamicAttribute = {
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

export type DynamicPart = DynamicAttribute | ExpressionPart;
