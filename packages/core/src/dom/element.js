export class RumiousElement {
  constructor(type, props, children = []) {
    this.type = type;
    this.props = props;
    this.children = children;
  }
}

export class RumiousElementList{
  constructor(list){
    this.type = 'ELEMENT_LIST';
    this.children = list;
  }
  
  forEach(callback ){
    this.children.forEach(callback);
  }
}
