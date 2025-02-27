import { createOrGetData } from '../utils/data.js';
import { createElement } from '../utils/element.js';
import { RumiousUIOverlay } from './overlay.js';

export class RumiousUIOffcanvas {
  constructor(element) {
    this.element = element;
    this.data = createOrGetData(
      this.element,
      {
        overlay: new RumiousUIOverlay(createElement(
          "span",
          "overlay"
        ))
      }
    )
  }
  
  static generator(element) {
    return new RumiousUIOffcanvas(element);
  }
  
  open() {
    this.element.classList.add("open");
    this.data?.overlay?.open()
  }
  
  close() {
    this.element.classList.remove("open");
    this.data?.overlay?.close()
  }
  
  toggle() {
    if (this.element.classList.contains("open")) {
      this.close();
    } else {
      this.open();
    }
  }
}