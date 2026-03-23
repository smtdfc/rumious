export interface EffectFunc {
  (): void | (() => void);
  _c?: (() => void) | undefined;
  _d?: boolean | undefined;
}
export type CleanupFunc = () => void;
