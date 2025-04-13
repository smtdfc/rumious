export class RumiousElementRef {
  constructor(public target: HTMLElement) {}
  
  getElement(): HTMLElement {
    return this.target;
  }
  
  remove() {
    this.target.remove();
  }
  
  addChild(child: Node) {
    this.target.appendChild(child);
  }
  
  listChild(): NodeList {
    return this.target.childNodes;
  }
  
  querySelector(query: string): Node | null {
    return this.target.querySelector(query);
  }
  
  querySelectorAll(query: string): NodeList {
    return this.target.querySelectorAll(query);
  }
  
  set text(t: string) {
    this.target.textContent = t;
  }
  
  get text(): string | null {
    return this.target.textContent;
  }
  
  set value(v: string) {
    if (this.target instanceof HTMLInputElement || this.target instanceof HTMLTextAreaElement) {
      this.target.value = v;
    }
  }
  
  get value(): string | undefined {
    if (this.target instanceof HTMLInputElement || this.target instanceof HTMLTextAreaElement) {
      return this.target.value;
    }
    return undefined;
  }
  
  addClassName(className: string) {
    this.target.classList.add(className);
  }
  
  removeClassName(className: string) {
    this.target.classList.remove(className);
  }
  
  hasClassName(className: string): boolean {
    return this.target.classList.contains(className);
  }
  
  toggleClass(className: string, force ? : boolean): boolean {
    return this.target.classList.toggle(className, force);
  }
  
  setStyle(styles: Partial < CSSStyleDeclaration > ) {
    Object.assign(this.target.style, styles);
  }
  
  getStyle(property: string): string {
    return getComputedStyle(this.target).getPropertyValue(property);
  }
  
  setAttribute(key: string, value: string) {
    this.target.setAttribute(key, value);
  }
  
  getAttribute(key: string): string | null {
    return this.target.getAttribute(key);
  }
  
  removeAttribute(key: string) {
    this.target.removeAttribute(key);
  }
  
  on(event: string, callback: EventListener, options ? : AddEventListenerOptions) {
    this.target.addEventListener(event, callback, options);
  }
  
  off(event: string, callback: EventListener, options ? : EventListenerOptions) {
    this.target.removeEventListener(event, callback, options);
  }
  
  setInnerHTML(html: string) {
    this.target.innerHTML = html;
  }
  
  getBoundingRect(): DOMRect {
    return this.target.getBoundingClientRect();
  }
  
  isInViewport(): boolean {
    const rect = this.target.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }
  
  prependChild(child: Node) {
    this.target.prepend(child);
  }
  
  setDisabled(disabled: boolean) {
    if (
      this.target instanceof HTMLButtonElement ||
      this.target instanceof HTMLInputElement ||
      this.target instanceof HTMLTextAreaElement
    ) {
      this.target.disabled = disabled;
    }
  }
  
  addClasses(...classNames: string[]) {
    this.target.classList.add(...classNames);
  }
  
  removeClasses(...classNames: string[]) {
    this.target.classList.remove(...classNames);
  }
  
  replaceClass(oldClass: string, newClass: string) {
    this.target.classList.replace(oldClass, newClass);
  }
  
  moveTo(newParent: HTMLElement) {
    newParent.appendChild(this.target);
  }
  
  getParent(): HTMLElement | null {
    return this.target.parentElement;
  }
  
  getNextSibling(): HTMLElement | null {
    return this.target.nextElementSibling as HTMLElement | null;
  }
  
  getPreviousSibling(): HTMLElement | null {
    return this.target.previousElementSibling as HTMLElement | null;
  }
  
  hide() {
    this.target.style.display = 'none';
  }
  
  show() {
    this.target.style.removeProperty('display');
  }
  
  isHidden(): boolean {
    return window.getComputedStyle(this.target).display === 'none';
  }
  
  scrollIntoView(options: ScrollIntoViewOptions = { behavior: 'smooth' }) {
    this.target.scrollIntoView(options);
  }
  
  matches(selector: string): boolean {
    return this.target.matches(selector);
  }
  
  getChildren(): HTMLElement[] {
    return Array.from(this.target.children) as HTMLElement[];
  }
  
  insertAfter(newNode: Node) {
    if (this.target.parentNode) {
      this.target.parentNode.insertBefore(newNode, this.target.nextSibling);
    }
  }
  
  insertBefore(newNode: Node) {
    if (this.target.parentNode) {
      this.target.parentNode.insertBefore(newNode, this.target);
    }
  }
  
  clearChildren() {
    while (this.target.firstChild) {
      this.target.removeChild(this.target.firstChild);
    }
  }
  
  animate(keyframes: Keyframe[], options: KeyframeAnimationOptions | number) {
    return this.target.animate(keyframes, options);
  }
}