export class RumiousChildrensRef {
  constructor(element) {
    this.target = element;
  }
  
  query(q) {
    return this.target.querySelectorAll(q);
  }
  
  index(idx) {
    return Array.from(this.target.children)[idx];
  }

  list() {
    return Array.from(this.target.children);
  }

  get parent() {
    return this.target;
  }

  remove() {
    this.target.remove();
  }

  addChild(element) {
    this.target.appendChild(element);
  }

  set(element) {
    this.target = element;
  }
}

export function createChildrensRef(element) {
  return new RumiousChildrensRef(element);
}