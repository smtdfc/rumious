import type { RumiousRouterModule } from "../router.js";

export class RumiousRouterMemoryStrategy {
  private currentPath = "";
  private historyStack: string[] = [];
  private historyIndex = -1;
  
  constructor(public router: RumiousRouterModule) {}
  
  redirect(path: string, replace: boolean = false): void {
    const normalizedPath = path.replace(/^\/+/, "");
    
    if (replace && this.historyIndex >= 0) {
      this.historyStack[this.historyIndex] = normalizedPath;
    } else {
      this.historyStack = this.historyStack.slice(0, this.historyIndex + 1);
      this.historyStack.push(normalizedPath);
      this.historyIndex++;
    }
    
    this.currentPath = normalizedPath;
    this.router.resolve(normalizedPath);
  }
  
  start(): void {
    if (this.currentPath) {
      this.router.resolve(this.currentPath);
    }
  }
  
  getCurrentPath(): string {
    return this.currentPath;
  }
  
  back(): void {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.currentPath = this.historyStack[this.historyIndex];
      this.router.resolve(this.currentPath);
    }
  }
  
  forward(): void {
    if (this.historyIndex < this.historyStack.length - 1) {
      this.historyIndex++;
      this.currentPath = this.historyStack[this.historyIndex];
      this.router.resolve(this.currentPath);
    }
  }
}