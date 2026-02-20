import type { State } from "../state";
import { ComponentMetadata } from "./factory";

function makeBuiltIn<T>(): ComponentMetadata<T> &
  (new (props: T) => ComponentMetadata<T>) {
  return new ComponentMetadata(class {}, "", "", false) as any;
}

export type Iterator<T> = Array<T> | State<Array<T>>;

export type ForComponentProps<T, U> = {
  template: ComponentMetadata<ForItem<T, U>>;
  data: Iterator<T>;
  key: (index: number, data: T) => any;
  other: U;
};

export type ForItem<T, U> = {
  data: T;
  other: U;
};

export const For = makeBuiltIn() as {
  new <T, U>(
    props: ForComponentProps<T, U>,
  ): ComponentMetadata<ForComponentProps<T, U>>;
} & ComponentMetadata<any>;

export type FragmentProps = {
  children?: any;
};

export const Fragment = makeBuiltIn<FragmentProps>();
