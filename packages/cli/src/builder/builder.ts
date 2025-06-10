export abstract class Builder {
  constructor(
    protected currentDir: string,
    protected configFilePath: string,
    protected watch: boolean = false
  ) {}
  
  abstract run(): void;
}