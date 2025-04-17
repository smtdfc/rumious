import { RumiousRenderContext } from '../render/context.js'
import { RumiousRenderTemplate } from '../render/template.js';
import { RumiousModule, RumiousModuleInstance } from './module.js';
import { render } from '../render/render.js';

interface RumiousAppOptions {}

export class RumiousApp {
  private root: HTMLElement;
  public options: RumiousAppOptions;
  public modules: RumiousModuleInstance[];
  private context: RumiousRenderContext;
  constructor(root: HTMLElement, options: RumiousAppOptions = {}) {
    this.root = root;
    this.options = options;
    this.modules = [];
    this.context = new RumiousRenderContext(this,this);
  }
  
  addModule(module: RumiousModule, options: any): RumiousModuleInstance {
    let instance = module.init(this, options);
    this.modules.push(instance);
    return  instance;
  }
  
  render(template: JSX.Element) {
    render(this.context, template, this.root);
  }
}

export function createApp(root:HTMLElement,options?:RumiousAppOptions):RumiousApp{
  return new RumiousApp(root,options);
}