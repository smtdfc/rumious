import { RumiousStateBind, RumiousChangeCommit } from '../types/index.js';

export class RumiousReactor < T = any > {
  private bindings: RumiousStateBind < T > [] = [];
  private internal: RumiousStateBind < T > [] = [];
  public isUIBatch = true;
  private scheduled = false;
  private queuedCommits: RumiousChangeCommit < T > [] = [];
  
  
  constructor(public target: T) {}
  
  addBinding(binding: RumiousStateBind < T > ): void {
    this.bindings.push(binding);
  }
  
  removeBinding(binding: RumiousStateBind < T > ): void {
    this.bindings = this.bindings.filter(b => b !== binding);
  }
  
  addInternalBinding(binding: RumiousStateBind < T > ): void {
    this.internal.push(binding);
  }
  
  removeInternalBinding(binding: RumiousStateBind < T > ): void {
    this.internal = this.internal.filter(b => b !== binding);
  }
  
  notify(commit: RumiousChangeCommit < T > ): void {
    for (const binding of this.bindings) {
      binding(commit);
    }
    
    if (this.isUIBatch) {
      this.scheduleInternalUpdate(commit);
    } else {
      for (const binding of this.internal) {
        binding(commit);
      }
    }
  }
  
  
  private scheduleInternalUpdate(commit: RumiousChangeCommit < T > ) {
    this.queuedCommits.push(commit);
    
    if (!this.scheduled) {
      this.scheduled = true;
      queueMicrotask(() => {
        this.flushInternal();
      });
    }
  }
  
  private flushInternal() {
    const lastCommit = this.queuedCommits[this.queuedCommits.length - 1];
    
    for (const binding of this.internal) {
      binding(lastCommit); // chỉ gửi commit cuối cùng
    }
    
    this.queuedCommits = [];
    this.scheduled = false;
  }
}