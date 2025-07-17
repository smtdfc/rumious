export class Ref<T extends HTMLElement> {
  public element: T | null = null;

  setTarget(target: T) {
    this.element = target;
  }

  isSet(): boolean {
    return this.element !== null;
  }

  addClass(name: string) {
    this.element?.classList.add(name);
  }

  removeClass(name: string) {
    this.element?.classList.remove(name);
  }

  toggleClass(name: string) {
    this.element?.classList.toggle(name);
  }

  get value(): string {
    return (this.element as any).value ?? '';
  }

  set value(v: string) {
    if (this.element && 'value' in this.element) {
      (this.element as any).value = v;
    }
  }

  set text(t: string) {
    if (this.element) this.element.textContent = t;
  }

  get text(): string {
    return this.element?.textContent ?? '';
  }

  set html(t: string) {
    if (this.element) this.element.innerHTML = t;
  }

  get html(): string {
    return this.element?.innerHTML ?? '';
  }

  addChild(node: Node) {
    this.element?.appendChild(node);
  }

  clear() {
    if (this.element) this.element.innerHTML = '';
  }

  setAttr(name: string, value: string) {
    this.element?.setAttribute(name, value);
  }

  getAttr(name: string): string | null {
    return this.element?.getAttribute(name) ?? null;
  }

  removeAttr(name: string) {
    this.element?.removeAttribute(name);
  }

  on<K extends keyof HTMLElementEventMap>(
    event: K,
    listener: (ev: HTMLElementEventMap[K]) => any,
  ) {
    this.element?.addEventListener(event, listener);
  }

  off<K extends keyof HTMLElementEventMap>(
    event: K,
    listener: (ev: HTMLElementEventMap[K]) => any,
  ) {
    this.element?.removeEventListener(event, listener);
  }

  focus() {
    (this.element as any)?.focus?.();
  }

  blur() {
    (this.element as any)?.blur?.();
  }

  hide() {
    if (this.element) this.element.style.display = 'none';
  }

  show(display: string = 'block') {
    if (this.element) this.element.style.display = display;
  }

  setStyle(property: string, value: string) {
    if (this.element) this.element.style.setProperty(property, value);
  }

  getStyle(property: string): string {
    return this.element?.style.getPropertyValue(property) ?? '';
  }

  remove() {
    this.element?.remove();
    this.element = null;
  }
}

export function createRef<T extends HTMLElement>(): Ref<T> {
  return new Ref<T>();
}
