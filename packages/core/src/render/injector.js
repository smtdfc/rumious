import { RumiousComponent } from '../component/component.js';

/**
 * Class for injecting HTML or text content into a target DOM element.
 *  
 */
export class RumiousContentInjector {
  /**
   * @constructor
   * @param {HTMLElement|null} target - The target element where content will be injected.
   */
  constructor() {
    /** @type {Array<{type: 'html' | 'text', contents: string}>} */
    this.contents = [];
  }
  
  commit(type='html',contents){
    this.contents.push({
      type,
      contents
    })
  }
  
  reset(){
    this.contents = [];
  }
  
  injectInTo(target) {
    target.innerHTML = '';
    this.contents.forEach((inject_) => {
      if (inject_.type === 'html') {
        target.innerHTML += inject_.contents;
      } else {
        target.textContent = inject_.contents;
      }
    });
  }
}


/**
 * Creates a new content injector with HTML content.
 * @param {string} [html=''] - The HTML content to inject.
 * @returns {RumiousContentInjector} A content injector instance with the HTML content set.
 */
export function injectHTML(html = '') {
  let injectorObj = new RumiousContentInjector(null);
  injectorObj.contents.push({
    type: 'html',
    contents: html,
  });
  return injectorObj;
}

/**
 * Creates a new content injector with text content.
 * @param {string} [text=''] - The text content to inject.
 * @returns {RumiousContentInjector} A content injector instance with the text content set.
 */
export function injectText(text = '') {
  let injectorObj = new RumiousContentInjector(null);
  injectorObj.contents.push({
    type: 'text',
    contents: text,
  });
  return injectorObj;
}