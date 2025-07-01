import { RumiousTemplate } from '../types/index.js';
import { RumiousRenderContext } from './context.js';
import { render, renderFrag } from './render.js';

export interface RumiousViewControlTarget {
  element: HTMLElement,
  context: RumiousRenderContext
}

export class RumiousViewControl {
  private targets: RumiousViewControlTarget[] = [];
  
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
  
  removeChild(index: number) {
    for (let i = 0; i < this.targets.length; i++) {
      let parent = this.targets[i].element.parentElement;
      if (!parent) return;
      let element = parent.children[index];
      if (element) parent.removeChild(element);
    }
  }
  
  addChild(
    template: RumiousTemplate,
    prepend: boolean = false
  ) {
    const targets = this.targets;
    if (targets.length === 0) {
      throw new Error(`RumiousRenderError: No target assigned to ViewControl`);
    }
    
    for (let i = 0; i < targets.length; i++) {
      let templ = renderFrag(template, targets[i].context);
      if (!prepend) targets[i].element.appendChild(templ);
      else targets[i].element.prepend(templ);
    }
  }
  
  
  each(callback: (target: RumiousViewControlTarget) => any) {
    for (let target of this.targets) {
      callback(target);
    }
  }
  
  emptyAll() {
    const targets = this.targets;
    for (let i = 0; i < targets.length; i++) {
      targets[i].element.textContent = '';
    }
  }
  
  empty(target: HTMLElement) {
    const targets = this.targets;
    for (let i = 0; i < targets.length; i++) {
      if (targets[i].element === target) {
        target.textContent = '';
        return;
      }
    }
  }
  
  updateChild(index: number, template: RumiousTemplate) {
    for (let i = 0; i < this.targets.length; i++) {
      const { element, context } = this.targets[i];
      const parent = element.parentElement;
      if (!parent) continue;
      
      const oldChild = parent.children[index];
      const newNode = renderFrag(template, context);
      
      if (oldChild) {
        parent.replaceChild(newNode, oldChild);
      }
    }
  }
  
}

export function createViewControl(): RumiousViewControl {
  return new RumiousViewControl();
}