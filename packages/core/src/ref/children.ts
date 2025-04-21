export class RumiousChildrenRef {
  constructor(public target: HTMLElement) {}

  list(): HTMLElement[] {
    return Array.from(this.target.children) as HTMLElement[];
  }

  getChild(index: number): HTMLElement | undefined {
    return this.list()[index];
  }

  remove(index: number) {
    this.list()[index]?.remove();
  }

  add(child: HTMLElement) {
    this.target.appendChild(child);
  }

  querySelector(query: string): HTMLElement | null {
    return this.target.querySelector(query);
  }

  querySelectorAll(query: string): NodeListOf<HTMLElement> {
    return this.target.querySelectorAll(query);
  }

  clear(): void {
    this.target.innerHTML = '';
  }

  replaceChild(index: number, newChild: HTMLElement): void {
    const oldChild = this.getChild(index);
    if (oldChild) {
      this.target.replaceChild(newChild, oldChild);
    }
  }

  insertBefore(newChild: HTMLElement, index: number): void {
    const referenceChild = this.getChild(index);
    if (referenceChild) {
      this.target.insertBefore(newChild, referenceChild);
    } else {
      this.add(newChild);
    }
  }

  prepend(child: HTMLElement): void {
    this.target.prepend(child);
  }

  getFirstChild(): HTMLElement | undefined {
    return this.list()[0];
  }

  getLastChild(): HTMLElement | undefined {
    return this.list()[this.list().length - 1];
  }

  hasChildren(): boolean {
    return this.target.hasChildNodes();
  }

  count(): number {
    return this.target.children.length;
  }

  find(
    predicate: (child: HTMLElement, index: number) => boolean
  ): HTMLElement | undefined {
    return this.list().find(predicate);
  }

  forEach(callback: (child: HTMLElement, index: number) => void): void {
    this.list().forEach(callback);
  }

  removeAllMatching(query: string): void {
    this.querySelectorAll(query).forEach((element) => element.remove());
  }

  toggleClass(className: string): void {
    this.list().forEach((child) => child.classList.toggle(className));
  }

  setAttribute(key: string, value: string): void {
    this.list().forEach((child) => child.setAttribute(key, value));
  }
}
