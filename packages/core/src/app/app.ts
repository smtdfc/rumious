import { RumiousRenderContext } from '../render/context.js';
import {
  RumiousModule,
  RumiousModuleClass,
} from './module.js';
import { render } from '../render/render.js';

export interface RumiousAppOptions {}

export class RumiousApp {
  private root: HTMLElement;
  public options: RumiousAppOptions;
  public modules: any[];
  private context: RumiousRenderContext;
  constructor(root: HTMLElement, options: RumiousAppOptions = {}) {
    this.root = root;
    this.options = options;
    this.modules = [];
    this.context = new RumiousRenderContext(this, this);
  }
  
  addModule < T extends RumiousModule, O > (
    ModuleClass: RumiousModuleClass < T, O > ,
    options ? : O
  ): T {
    const instance = ModuleClass.init(this, options);
    this.modules.push(instance);
    return instance;
  }
  
  render(template: JSX.Element) {
    render(this.context, template, this.root);
  }
}

export function createApp(
  root: HTMLElement,
  options ? : RumiousAppOptions
): RumiousApp {
  return new RumiousApp(root, options);
}