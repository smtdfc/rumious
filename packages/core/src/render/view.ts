import {RumiousTemplate} from '../types/index.js';
import {RumiousRenderContext} from './context.js';
import {render} from './render.js';

export interface RumiousViewControlTarget{
  element:HTMLElement,
  context:RumiousRenderContext
}

export class RumiousViewControl {
  private targets:RumiousViewControlTarget[] = [];
  
  constructor() {}
  
  addTarget(target: RumiousViewControlTarget) {
    this.targets.push(target);
  }
  

  setView(template: RumiousTemplate) {
    
    const targets = this.targets;
    
    if (targets.length === 0) {
      throw new Error(`RumiousRenderError: No target assigned to ViewControl`);
    }
    
    for (let i = 0; i < targets.length; i++) {
      render(template, targets[i].element, targets[i].context);
    }
  }
  
  each(callback:(target:RumiousViewControlTarget)=> any){
    for (let target of this.targets) {
      callback(target);
    }
  }
  
  emptyAll() {
    const targets = this.targets;
    for (let i = 0; i < targets.length; i++) {
      targets[i].textContent = '';
    }
  }
  
  empty(target: HTMLElement) {
    const targets = this.targets;
    for (let i = 0; i < targets.length; i++) {
      if (targets[i] === target) {
        target.textContent = '';
        return;
      }
    }
  }
}

export function createViewControl(): RumiousViewControl {
  return new RumiousViewControl();
}

