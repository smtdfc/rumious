export class RumiousRenderContext{
  constructor(target){
    this.target = target;
  }
  
  find(name){
    return this.target[name];
  }
  
  get(name){
    return this.target[name];
  }
}