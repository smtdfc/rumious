export type RumiousConfigFile = {
  name?: string;
  entryPoint?: string | null;
  lang?: 'js' | 'ts' | null;
  builder?: string;
  rollupConfigFile?: string;
};

export interface BuildCommandOptions {
  watch?: boolean;
}
