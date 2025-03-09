export class RumiousUIOverlay {
  constructor(element) {
    this.element = element;
  }
  
  static name="overlay"
  static generator(element) {
    return new RumiousUIOverlay(element);
  }
  
  open() {
    this.element.classList.add("active");
  }
  
  close() {
    this.element.classList.remove("active");
  }
  
  toggle() {
    if (this.element.classList.contains("active")) {
      this.close();
    } else {
      this.open();
    }
  }
}