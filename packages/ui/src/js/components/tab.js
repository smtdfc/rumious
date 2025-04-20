import { createOrGetData } from '../utils/data.js';
import { createElement } from '../utils/element.js';
import { generateId } from '../utils/key.js';

export class RumiousUITab {
    constructor(element) {
      this.element = element;
      this.indicator = this.element.querySelector('.tab-indicator') ?? createElement('div','tab-indicator');
      this.metadata = createOrGetData(this.element, {
        id: generateId(),
        isObserve: false,
        activeItem: this.getActiveItem() ?? createElement('div','tab'),
        index:0
      });
      
      if (!this.metadata.isObserve) this._setup();
    }
    
    static name = 'tab';
    
    static generator(element) {
      return new RumiousUITab(element);
    }
    
    _setup() {
      const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
          mutation.addedNodes.forEach(node => {
            if (node.classList?.contains('tab')) {
              this.updateIndicator(this.metadata.activeItem);
            }
          });
        });
      });
      
      observer.observe(this.element, { childList: true });
    }
    
    updateIndicator(anchor = createElement('div')) {
      const containerRect = this.element.getBoundingClientRect();
      const anchorRect = anchor.getBoundingClientRect();
      const left = anchorRect.left - containerRect.left + this.element.scrollLeft;
      const width = anchorRect.width;
      this.indicator.style.left = left + 'px';
      this.indicator.style.width = width + 'px';
    }
    
    getActiveItem() {
      for (let element of Array.from(this.element.children)) {
        if (element.classList.contains('active')) return element;
      }
    }
    
    inactiveAll() {
      Array.from(this.element.children).forEach(element => {
        element.classList.remove('active');
        if (element.dataset.panel) {
          document.querySelector(element.dataset.panel).classList.remove('active');
        }
      });
    }
    
    setTabByIndex(index, force=false){
      if(this.metadata.index === index && !force) return;
      this.metadata.index = index;
      this.active(this.element.children[index]);
    }
    
    active(element) {
      this.inactiveAll();
      this.metadata.activeItem = element;
      this.updateIndicator(element);
      element.classList.add('active');
      
      if(element.dataset.panel){
        document.querySelector(element.dataset.panel).classList.add('active');
      }
    }
    
    action(info) {
      switch (info.type) {
        
        case 'active':
          this.active(info.trigger);
          break;
          
        default:
          throw 'Unsupported action !';
      }
    }
    
  }
  