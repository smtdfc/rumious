import { RumiousRenderContext, render } from '../render/index.js';
import { RumiousTemplate } from '../types/index.js';
import { RumiousModule, RumiousModuleClass } from '../module/index.js';

export interface RumiousAppConfig {
  root: HTMLElement;
}

export class RumiousApp {
  public modules: any[] = [];
  
  public context: RumiousRenderContext = new RumiousRenderContext(
    this,
    this
  );
  
  constructor(
    public config: RumiousAppConfig
  ) {}
  
  addModule < T extends RumiousModule, O > (
    ModuleClass: RumiousModuleClass < T, O > ,
    options ? : O
  ): T {
    const instance = ModuleClass.init(this, options);
    this.modules.push(instance);
    return instance;
  }
  
  render(
    content: RumiousTemplate
  ): void {
    render(
      content,
      this.config.root,
      this.context
    );
  }
}

export function createApp(
  config: RumiousAppConfig
): RumiousApp {
  return new RumiousApp(config);
}