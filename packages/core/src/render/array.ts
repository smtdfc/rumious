import { RumiousRenderTemplate } from './template.js';
import { RumiousArrayState } from '../state/array.js';
import { RumiousRenderContext } from './context.js';
import { RumiousStateCommit } from '../state/reactor.js';

type RumiousDynamicArrayRenderFn = (
  item: any,
  index: any
) => RumiousRenderTemplate;

export class RumiousDynamicArrayRenderer < T > {
  public anchorElement!: HTMLElement;
  public context!: RumiousRenderContext;
  constructor(
    public state: RumiousArrayState < T > ,
    public callback: RumiousDynamicArrayRenderFn
  ) {}
  
  prepare(anchor: HTMLElement, context: RumiousRenderContext): void {
    this.anchorElement = anchor;
    this.context = context;
  }
  
  async render() {
    this.state.reactor.addBinding(this.onStateChange.bind(this));
    
    requestAnimationFrame(() => {
      this.renderAll();
    });
  }
  
  renderAll() {
    this.anchorElement.textContent = "";
    let f = document.createDocumentFragment();
    this.state.value.forEach((value, index) => {
      let frag = document.createDocumentFragment();
      let template = this.callback(value, index);
      this.context.renderHelper(this.context, template, frag);
      f.appendChild(frag);
    });
    this.anchorElement.replaceChildren(f);
  }
  
  updateElement(index: number, value: any) {
    let currentElement = this.anchorElement.children[index];
    if (!currentElement) return;
    let template = this.callback(value, index);
    let frag = document.createDocumentFragment();
    this.context.renderHelper(this.context, template, frag);
    this.anchorElement.replaceChild(frag, currentElement);
  }
  
  insertOrAppendElement(value: any, index: number) {
    let frag = document.createDocumentFragment();
    let template = this.callback(value, index);
    this.context.renderHelper(this.context, template, frag);
    
    let currentElement = this.anchorElement.children[index];
    if (currentElement) {
      this.anchorElement.insertBefore(frag, currentElement);
    } else {
      this.anchorElement.appendChild(frag);
    }
  }
  
  removeElement(index: number) {
    let currentElement = this.anchorElement.children[index];
    if (!currentElement) return;
    currentElement.remove();
  }
  
  async onStateChange(commit: RumiousStateCommit < typeof this.state.value > ) {
    switch (commit.type) {
      case 'SET':
        requestAnimationFrame(() => {
          this.renderAll();
        });
        break;
        
      case 'SET_BY_KEY':
        this.updateElement(commit.key as number, commit.value);
        break;
        
      case 'REMOVE_BY_KEY':
        this.removeElement(commit.key as number);
        break;
        
      case 'INSERT_BY_KEY':
        this.insertOrAppendElement(commit.value, commit.key as number);
        break;
        
      case 'APPEND':
        this.insertOrAppendElement(commit.value, this.state.value.length);
        break;
        
      case 'PREPEND':
        let frag = document.createDocumentFragment();
        let value = commit.value;
        let template = this.callback(value, 0);
        this.context.renderHelper(this.context, template, frag);
        this.anchorElement.prepend(frag);
        break;
        
      default:
        requestAnimationFrame(() => {
          this.renderAll();
        });
    }
  }
}

export function renderDynamicArray < T > (
  state: RumiousArrayState < T > ,
  callback: RumiousDynamicArrayRenderFn,
) {
  return new RumiousDynamicArrayRenderer < T > (state, callback);
} 