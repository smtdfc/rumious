export class RumiousReducer{
  constructor(state,path="",fn){
    this.state = state;
    this.path = path;
    this.fn = fn;
  }
  
  trigger(...args){
    let value = this.fn(...args);
    this.state.set(this.path,value);
  }
}

