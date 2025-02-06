export class RumiousElementRef {
  constructor(element) {
    this.target = element;
  }

  set html(h) {
    this.target.innerHTML = h;
  }

  query(q) {
    return this.target.querySelectorAll(q);
  }

  set text(h) {
    this.target.textContent = h;
  }

  on(name, callback) {
    this.target.addEventListener(name, callback);
  }

  off(name, callback) {
    this.target.removeEventListener(name, callback);
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

export function createElementRef(element) {
  return new RumiousElementRef(element);
}