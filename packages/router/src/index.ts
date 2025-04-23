import type {
  RumiousApp,
  RumiousModuleInstance,
  RumiousModule,
  RumiousComponentConstructor,
} from 'rumious';

export class RumiousRouterModule {
  constructor(
    public app: RumiousApp,
    public configs?: RumiousRouterConfigs
  ) {
    console.log(this.configs);
  }

  static init(
    app: RumiousApp,
    opts?: RumiousRouterConfigs
  ): RumiousModuleInstance {
    return new RumiousRouterModule(app, opts);
  }
}

interface RumiousRouterRouteConfigs {
  path: string;
  components?: RumiousComponentConstructor[] | RumiousComponentConstructor;
  protect?: any;
}

interface RumiousRouterLayourWrapperConfigs {}

interface RumiousRouterConfigs {
  routes: RumiousRouterRouteConfigs[];
  layoutsWrappers?: Record<string, RumiousRouterLayourWrapperConfigs[]>;
}
