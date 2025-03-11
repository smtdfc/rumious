export class RumiousUIAccordion {
  constructor(element) {
    this.element = element;
  }
  
  static name='accordion'
  static generator(element) {
    return new RumiousUIAccordion(element);
  }
  
  open() {
    this.element.classList.add('open');
  }
  
  close() {
    this.element.classList.remove('open');
  }
  
  toggle() {
    if (this.element.classList.contains('open')) {
      this.close();
    } else {
      this.open();
    }
  }
}