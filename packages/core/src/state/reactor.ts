import {RumiousStateBind,RumiousChangeCommit} from '../types/index.js';
 
export class RumiousReactor < T = any > {
  private bindings: RumiousStateBind < T > [] = [];
  
  constructor(public target: T) {}
  
  
  addBinding(binding: RumiousStateBind < T > ): void {
    this.bindings.push(binding);
  }
  
  removeBinding(binding: RumiousStateBind < T > ): void {
    this.bindings = this.bindings.filter(b => b !== binding);
  }
  
  notify(commit: RumiousChangeCommit<T>): void {
    for (const binding of this.bindings) {
      binding(commit);
    }
  }
}