import { RumiousViewControl } from './view.js';
import { RumiousListState, RumiousState } from '../state/index.js';
import { RumiousTemplate, RumiousChangeCommit } from '../types/index.js';
import { renderFrag } from '../render/index.js';


export class RumiousPagination < T > {
  public currentPage = 0;
  public limit = 0;
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
    let size = this.data.value.length;
    let totalPage = Math.ceil(size / this.limit);
    let currentPage = Math.min(this.currentPage, totalPage - 1);
    let start = currentPage * this.limit;
    let end = Math.min(start + this.limit, size);
    return [start, end];
  }
  
  onDataChange(commit: RumiousChangeCommit < RumiousState < T[] >> ) {
    let [start, end] = this.pos;
    let data = commit.value;
    
    if (start > commit.key) {
      data = this.data.value[start - 1];
      this.view.removeChild(end - start);
      let key = this.keyFn(data);
      let templ = this.templFn(data);
      this.view.addChild(templ);
      this.view.removeChild(end - start);
    }
    
    if (start <= commit.key && commit.key <= end) {
      
    }
    
  }
}