export class StringBuilder {
  private buffer: string[];

  constructor(initialValue: string = "") {
    this.buffer = [initialValue];
  }

  append(value: string): this {
    if (value) {
      this.buffer.push(value);
    }
    return this;
  }

  appendLine(value: string = ""): this {
    this.append(value + "\n");
    return this;
  }

  isEmpty(): boolean {
    return (
      this.buffer.length === 0 ||
      (this.buffer.length === 1 && this.buffer[0] === "")
    );
  }

  clear(): void {
    this.buffer = [];
  }

  toString(): string {
    return this.buffer.join("");
  }
}
