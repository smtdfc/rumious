import { RumiousRenderTemplate } from "./template.js";
import { RumiousArrayState } from "../state/array.js";
import { RumiousRenderContext } from "./context.js";
import { RumiousStateCommit } from "../state/reactor.js";

type RumiousDynamicArrayRenderFn < T > = (item: any, index: any) => RumiousRenderTemplate;

export class RumiousDynamicArrayRenderer < T > {
  public anchorElement!: HTMLElement;
  public context!: RumiousRenderContext;
  private domMap: Map < any,Node > = new Map();
  private keyFn: (item: any, index: any) => any;
  
  constructor(
    public state: RumiousArrayState < T > ,
    public callback: RumiousDynamicArrayRenderFn < T > ,
    keyFn ? : (item: any, index: any) => any
  ) {
    this.keyFn = keyFn ?? ((_, i) => i);
  }
  
  prepare(anchor: HTMLElement, context: RumiousRenderContext): void {
    this.anchorElement = anchor;
    this.context = context;
  }
  
  async render() {
    await this.reconcile(this.state.value);
  }
  
  async onStateChange(commit: RumiousStateCommit < typeof this.state.value > ) {
    if (commit.type === "APPEND") {
      const key = this.keyFn(commit.item , commit.key );
      if (!this.domMap.has(key)) {
        const template = await this.callback(commit.item , commit.key);
        const frag = document.createDocumentFragment();
        this.context.renderHelper(this.context, template, frag);
        this.anchorElement.appendChild(frag);
        this.domMap.set(key, frag);
      }
    } else if (commit.type === "SET_BY_KEY") {
      const key = this.keyFn(commit.item , commit.key );
      const oldNode = this.anchorElement.childNodes[commit.key as number];
      if (oldNode) {
        const template = await this.callback(commit.item , commit.key);
        const frag = document.createDocumentFragment();
        this.context.renderHelper(this.context, template, frag);
        this.anchorElement.replaceChild(frag, oldNode);
        this.domMap.set(key, frag);
      }
    } else if (commit.type === "REMOVE_BY_KEY") {
      const node = this.anchorElement.childNodes[commit.key as number];
      if (node) {
        this.anchorElement.removeChild(node);
        const entry = [...this.domMap.entries()].find(([, n]) => n === node);
        if (entry) this.domMap.delete(entry[0]);
      }
    } else if (commit.type === "INSERT_BY_KEY") {
      const key = this.keyFn(commit.item, commit.key );
      if (!this.domMap.has(key)) {
        const template = await this.callback(commit.item , commit.key);
        const frag = document.createDocumentFragment();
        this.context.renderHelper(this.context, template, frag);
        const refNode = this.anchorElement.childNodes[commit.key as number] ?? null;
        this.anchorElement.insertBefore(frag, refNode);
        this.domMap.set(key, frag);
      }
    } else {
      await this.reconcile(this.state.value);
    }
  }
  
  private async reconcile(nextItems: T[]) {
    const oldMap = this.domMap;
    const newMap = new Map < any,Node > ();
    const newNodes: Node[] = [];
    
    for (let i = 0; i < nextItems.length; i++) {
      const item = nextItems[i];
      const key = this.keyFn(item, i);
      let node = oldMap.get(key);
      
      if (!node) {
        const template = await this.callback(item, i);
        const frag = document.createDocumentFragment();
        this.context.renderHelper(this.context, template, frag);
        node = frag;
      }
      
      newMap.set(key, node);
      newNodes.push(node);
    }
    
    this.anchorElement.textContent = "";
    for (const node of newNodes) {
      this.anchorElement.appendChild(node);
    }
    
    this.domMap = newMap;
  }
}

export function renderDynamicArray < T > (
  state: RumiousArrayState < T > ,
  callback: RumiousDynamicArrayRenderFn < T >
) {
  return new RumiousDynamicArrayRenderer < T > (state, callback);
}