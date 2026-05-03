export interface Config {
  root?: string;
  routesDir?: string;
}

export function defineConfig(config: Config): Config {
  return config;
}
