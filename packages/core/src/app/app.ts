import { RumiousRenderContext,render } from '../render/index.js';
import { RumiousTemplate } from '../types/index.js';

export interface RumiousAppConfig {
  root: HTMLElement;
}

export class RumiousApp {
  
  public context: RumiousRenderContext = new RumiousRenderContext(
    this,
    this
  );
  
  constructor(
    public config: RumiousAppConfig
  ) {}
  
  render(
    content:RumiousTemplate
  ):void{
    render(
      content,
      this.config.root,
      this.context
    );
  }
}

export function createApp(
  config:RumiousAppConfig
):RumiousApp{
  return new RumiousApp(config);
}