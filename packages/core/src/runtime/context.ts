export class Context {
  constructor(public parent?: Context) {}

  clean() {}
}
