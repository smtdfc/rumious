export class RumiousContentInjector{
  constructor(target){
    this.target = target;
    this.contents = []
  }
  
  inject(){
    this.target.innerHTML = '';
    this.contents.forEach(inject_ => inject_.type=='html' ? this.target.innerHTML+=inject_.contents : this.target.textContent = inject_.contents);
  }
  
}

export function injectHTML(html=''){
  let injectorObj = new RumiousContentInjector(null);
  injectorObj.contents.push({
    type:'html',
    contents:html
  });
  return injectorObj;
}

export function injectText(text=''){
  let injectorObj = new RumiousContentInjector(null);
  injectorObj.contents.push({
    type:'text',
    contents:text
  });
  return injectorObj;
}

