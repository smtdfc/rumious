export class ViewControl {
  private target: HTMLElement | null = null;

  setTarget(element: HTMLElement) {
    this.target = element;
  }

  addChild(child: HTMLElement) {
    if (this.target) this.target.appendChild(child);
  }

  removeChildByIndex(index: number) {
    if (this.target && this.target.children[index]) {
      this.target.children[index].remove();
    }
  }

  prependChild(child: HTMLElement) {
    if (this.target) this.target.prepend(child);
  }

  clean() {
    if (this.target) this.target.textContent = '';
  }
}
