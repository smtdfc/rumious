import {
  RumiousComponent,
  RumiousComponentElement
} from '../component/index.js';

export class RumiousRef {
  public element!: HTMLElement;
  private _mounted = false;
  private _onMountCallbacks: ((el: HTMLElement) => void)[] = [];
  private _onUnmountCallbacks: (() => void)[] = [];
  
  constructor() {}
  
  setTarget(element: HTMLElement) {
    this.element = element;
    this._mounted = true;
    for (const cb of this._onMountCallbacks) {
      cb(element);
    }
  }
  
  reset() {
    if (this._mounted) {
      for (const cb of this._onUnmountCallbacks) {
        cb();
      }
    }
    this.element = undefined as any;
    this._mounted = false;
  }
  
  get(): HTMLElement | undefined {
    return this._mounted ? this.element : undefined;
  }
  
  isMounted(): boolean {
    return this._mounted;
  }
  
  has(): boolean {
    return this.isMounted();
  }
  
  onMount(cb: (el: HTMLElement) => void) {
    this._onMountCallbacks.push(cb);
    if (this._mounted) cb(this.element);
  }
  
  onUnmount(cb: () => void) {
    this._onUnmountCallbacks.push(cb);
  }
  
  toString(): string {
    return `[RumiousRef ${this._mounted ? "mounted" : "not mounted"}]`;
  }
  
  
  focus() {
    this.assertMounted();
    this.element.focus();
  }
  
  addClass(className: string) {
    this.assertMounted();
    this.element.classList.add(className);
  }
  
  removeClass(className: string) {
    this.assertMounted();
    this.element.classList.remove(className);
  }
  
  toggleClass(className: string) {
    this.assertMounted();
    this.element.classList.toggle(className);
  }
  
  setAttr(key: string, value: string) {
    this.assertMounted();
    this.element.setAttribute(key, value);
  }
  
  removeAttr(key: string) {
    this.assertMounted();
    this.element.removeAttribute(key);
  }
  
  query < T extends Element = Element > (selector: string): T | null {
    this.assertMounted();
    return this.element.querySelector < T > (selector);
  }
  
  queryAll < T extends Element = Element > (selector: string): NodeListOf < T > {
    this.assertMounted();
    return this.element.querySelectorAll < T > (selector);
  }
  
  get value(): string | undefined {
    this.assertMounted();
    return 'value' in this.element ? (this.element as any).value : undefined;
  }
  
  set value(val: string | undefined) {
    this.assertMounted();
    if ('value' in this.element) {
      (this.element as any).value = val;
    } else {
      throw new Error("RumiousRefError: Element has no 'value' property.");
    }
  }
  
  get text(): string | null {
    this.assertMounted();
    return this.element.textContent;
  }
  
  set text(val: string | null) {
    this.assertMounted();
    this.element.textContent = val;
  }
  
  get html(): string {
    this.assertMounted();
    return this.element.innerHTML;
  }
  
  set html(val: string) {
    this.assertMounted();
    this.element.innerHTML = val;
  }
  
  get checked(): boolean {
    this.assertMounted();
    return 'checked' in this.element ? Boolean((this.element as any).checked) : false;
  }
  
  set checked(val: boolean) {
    this.assertMounted();
    if ('checked' in this.element) {
      (this.element as any).checked = val;
    } else {
      throw new Error("RumiousRefError: Element has no 'checked' property.");
    }
  }
  
  get disabled(): boolean {
    this.assertMounted();
    return 'disabled' in this.element ? Boolean((this.element as any).disabled) : false;
  }
  
  set disabled(val: boolean) {
    this.assertMounted();
    if ('disabled' in this.element) {
      (this.element as any).disabled = val;
    } else {
      throw new Error("RumiousRefError: Element has no 'disabled' property.");
    }
  }
  
  get component():RumiousComponent | null{
    if(this.element instanceof RumiousComponentElement){
      return this.element.instance;
    }else{
      return null;
    }
  }
  
  private assertMounted() {
    if (!this._mounted) {
      throw new Error("RumiousRefError: Element is not mounted.");
    }
  }
}


export function createRef(): RumiousRef {
  return new RumiousRef();
}