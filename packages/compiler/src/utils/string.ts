export class StringBuilder {
  private lines: string[] = [];
  private level: number = 0;

  constructor(private indentStr: string = "  ") {}

  add(line: string): this {
    if (line.trim() === "") {
      this.lines.push("");
    } else {
      this.lines.push(this.indentStr.repeat(this.level) + line);
    }
    return this;
  }

  indent(): this {
    this.level++;
    return this;
  }

  outdent(): this {
    this.level = Math.max(0, this.level - 1);
    return this;
  }

  block(label: string, callback: () => void): this {
    this.add(`${label} {`);
    this.indent();
    callback();
    this.outdent();
    this.add(`}`);
    return this;
  }

  toString(): string {
    return this.lines.join("\n");
  }
}
