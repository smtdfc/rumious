type Cleanable = {
  clean: () => void;
};

export class Context {
  public childrens: Cleanable[] = [];
  public deferrers: (() => void)[] = [];
  public cleanups: (() => void)[] = [];

  constructor(public parent?: Context) {}

  clean() {
    while (this.childrens.length > 0) {
      this.childrens.pop()!.clean();
    }

    while (this.cleanups.length > 0) {
      this.cleanups.pop()!();
    }

    this.deferrers.length = 0;
  }
}
