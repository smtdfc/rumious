export class RumiousContentInjector{
  constructor(target){
    this.target = target;
    this.contents = []
  }
  
  inject(){
    this.target.innerHTML = '';
    this.contents.forEach(content=> this.target.innerHTML+=content);
  }
  
}

export function injector(html=''){
  let injectorObj = new RumiousContentInjector(null);
  injectorObj.contents.push(html);
  return injectorObj;
}

