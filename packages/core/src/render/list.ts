import { RumiousViewControl } from './view.js';
import { RumiousListState, RumiousState } from '../state/index.js';
import { RumiousTemplate, RumiousChangeCommit } from '../types/index.js';
import { renderFrag } from '../render/index.js';


export class RumiousPagination < T > {
  public currentPage = 0;
  public limit = 50;
  public pos = [0, 0];
  constructor(
    public view: RumiousViewControl,
    public data: RumiousListState < T > ,
    public templFn: (data: T) => RumiousTemplate,
    public keyFn: (data: T) => string
  ) {}
  
  show() {
    
    let [start, end] = this.calcPos();
    let list = this.data.value.slice(start, end);
    this.pos = [start, end];
    for (let data of list) {
      let key = this.keyFn(data);
      let templ = this.templFn(data);
      this.view.addChild(templ);
    }
    
    if (!this.data.reactor) return;
    this.data.reactor.addInternalBinding(this.onDataChange.bind(this));
  }
  
  calcPos(): [number, number] {
    const size = this.data.value.length;
    const totalPage = Math.ceil(size / this.limit);
    const currentPage = Math.max(0, Math.min(this.currentPage, totalPage - 1));
    const start = currentPage * this.limit;
    const end = Math.min(start + this.limit, size);
    return [start, end];
  }
  
  
  onDataChange(commit: RumiousChangeCommit < RumiousState < T[] >> ) {
    const [start, end] = this.calcPos();
    const total = this.data.value.length;
    
    const { type, key, value } = commit;
    
    if (type === 'set') {
      this.view.emptyAll();
      this.show();
      return;
    }
    
    if (typeof key === 'number' && key < start) {
      this.view.emptyAll();
      this.show();
      return;
    }

    if (typeof key === 'number' && key >= start && key < end) {
      const indexInView = key - start;
      
      switch (type) {
        case 'update': {
          const item = this.data.value[key];
          const templ = this.templFn(item);
          this.view.updateChild(indexInView, templ);
          break;
        }
        
        case 'remove': {
          this.view.removeChild(indexInView);
          
          const extraIndex = end - 1;
          if (extraIndex < total) {
            const extraItem = this.data.value[extraIndex];
            const extraTemplate = this.templFn(extraItem);
            this.view.addChild(extraTemplate);
          }
          break;
        }
        
        case 'insert':
        case 'prepend': {
          const item = this.data.value[key];
          const templ = this.templFn(item);
          this.view.addChild(templ, true); 
          const currentViewSize = end - start + 1;
          if (currentViewSize > this.limit) {
            this.view.removeChild(this.limit);
          }
          break;
        }
        
        case 'append': {
          if (key < start + this.limit) {
            const item = this.data.value[key];
            const templ = this.templFn(item);
            this.view.addChild(templ);
            
            const currentViewSize = end - start + 1;
            if (currentViewSize > this.limit) {
              this.view.removeChild(0);
            }
          }
          break;
        }
      }
      
      return;
    }
    
  }
}