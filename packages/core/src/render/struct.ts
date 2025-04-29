import { RumiousRenderTemplate } from './template.js';
import { RumiousArrayState } from '../state/array.js';
import { RumiousRenderContext } from './context.js';
import { RumiousStateCommit } from '../state/reactor.js';
import { RumiousState } from '../state/state.js';

type RumiousListRenderFn = (item: any, index: any) => RumiousRenderTemplate;

export class RumiousListRenderer < T > {
  public anchorElement!: HTMLElement;
  public context!: RumiousRenderContext;
  
  constructor(
    public state: RumiousArrayState < T > ,
    public callback: RumiousListRenderFn
  ) {}
  
  prepare(anchor: HTMLElement, context: RumiousRenderContext): void {
    this.anchorElement = anchor;
    this.context = context;
  }
  
  private renderItem(value: T, index: number): DocumentFragment {
    const frag = document.createDocumentFragment();
    const template = this.callback(value, index);
    this.context.renderHelper(this.context, template, frag);
    return frag;
  }
  
  protected scheduleRenderAll() {
    requestAnimationFrame(() => this.renderAll());
  }
  
  async render() {
    this.state.reactor.addBinding(this.onStateChange.bind(this));
    this.scheduleRenderAll();
  }
  
  renderAll() {
    const f = document.createDocumentFragment();
    this.state.value.forEach((value, index) => {
      f.appendChild(this.renderItem(value, index));
    });
    this.anchorElement.replaceChildren(f);
  }
  
  updateElement(index: number, value: any) {
    const current = this.anchorElement.children[index];
    if (!current) return;
    this.anchorElement.replaceChild(this.renderItem(value, index), current);
  }
  
  insertOrAppendElement(value: any, index: number) {
    const frag = this.renderItem(value, index);
    const current = this.anchorElement.children[index];
    current
      ?
      this.anchorElement.insertBefore(frag, current) :
      this.anchorElement.appendChild(frag);
  }
  
  removeElement(index: number) {
    this.anchorElement.children[index]?.remove();
  }
  
  appendElement(values: any, startIndex: number) {
    if (Array.isArray(values)) {
      const f = document.createDocumentFragment();
      values.forEach((value, index) => {
        f.appendChild(this.renderItem(value, startIndex + index));
      });
      this.anchorElement.replaceChildren(f);
      
      this.anchorElement.appendChild(f);
    }
  }
  
  async onStateChange(commit: RumiousStateCommit < typeof this.state.value > ) {
    switch (commit.type) {
      case 'SET':
        this.scheduleRenderAll();
        break;
      case 'SET_BY_KEY':
        this.updateElement(commit.key as number, commit.value);
        break;
      case 'REMOVE_BY_KEY':
        this.removeElement(commit.key as number);
        break;
      case 'INSERT_BY_KEY':
        this.insertOrAppendElement(commit.value, commit.key as number);
        break;
      case 'APPEND':
        this.appendElement(commit.value, this.state.value.length - (commit.value as T[]).length);
        break;
      case 'PREPEND':
        this.anchorElement.prepend(this.renderItem(commit.value as T, 0));
        break;
      default:
        this.scheduleRenderAll();
    }
  }
}

export function renderList < T > (
  state: RumiousArrayState < T > ,
  callback: RumiousListRenderFn
) {
  return new RumiousListRenderer < T > (state, callback);
}

export interface RumiousInfintyScrollRenderOptions < T > {
  data: RumiousArrayState < T > ;
  template: RumiousListRenderFn;
  loader ? : (limit: number, offset: number) => T[] | Promise < T[] > ;
  scrollElement: HTMLElement | Window;
  state ? : RumiousState < string > ;
  limit ? : number;
  offset ? : number;
  threshold: number;
}

export class RumiousInfintyScrollRenderer < T > extends RumiousListRenderer < T > {
  private limit: number;
  private offset: number;
  private isLoading = false;
  
  constructor(public options: RumiousInfintyScrollRenderOptions < T > ) {
    super(options.data, options.template);
    this.limit = options.limit ?? 50;
    this.offset = options.offset ?? 0;
  }
  
  private setState(name: string) {
    this.options.state?.set(name);
  }
  
  private async fetchData(): Promise < T[] > {
    const data = await this.options.loader?.(this.limit, this.offset) ?? [];
    this.offset += data.length;
    return data;
  }
  
  private getScrollInfo() {
    const el = this.options.scrollElement;
    return el === window ?
    {
      scrollTop: window.scrollY,
      scrollHeight: document.documentElement.scrollHeight,
      clientHeight: window.innerHeight,
    } :
    {
      scrollTop: (el as HTMLElement).scrollTop,
      scrollHeight: (el as HTMLElement).scrollHeight,
      clientHeight: (el as HTMLElement).clientHeight,
    };
  }
  
  async render(): Promise < void > {
    const anchorElement = this.options.scrollElement;
    const onScroll = async () => {
      const { scrollTop, scrollHeight, clientHeight } = this.getScrollInfo();
      if (scrollTop + clientHeight >= scrollHeight - this.options.threshold && !this.isLoading) {
        this.isLoading = true;
        this.setState('START_FETCH');
        const newData = await this.fetchData();
        this.setState('END_FETCH');
        if (newData.length === 0) {
          this.setState('NO_DATA');
          anchorElement.removeEventListener('scroll', onScroll);
        } else {
          this.state.append(...(Array.isArray(newData) ? newData : []));
        }
        this.isLoading = false;
      }
    };
    
    anchorElement.addEventListener('scroll', onScroll);
    this.state.reactor.addBinding(this.onStateChange.bind(this));
    this.scheduleRenderAll();
  }
}

export function createInfintyScroll < T > (options: RumiousInfintyScrollRenderOptions < T > ) {
  return new RumiousInfintyScrollRenderer(options);
}