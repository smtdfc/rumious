import type { TSESTree } from "@typescript-eslint/typescript-estree";

export type StaticProp = {
  type: "static_prop";
  name: string;
  value: string;
  loc: {
    name: TSESTree.SourceLocation;
    value: TSESTree.SourceLocation;
  };
};

export type ListProp = Array<StaticProp>;
export type Prop = StaticProp;

export type CompileOptions = {
  sourcemap: boolean;
  inlineSourcemap: boolean;
};
