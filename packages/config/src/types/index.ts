export interface Config {
  environment: string;
  builder?: {
    name: string;
  };
  lang?: 'typescript' | 'javascript';
}
