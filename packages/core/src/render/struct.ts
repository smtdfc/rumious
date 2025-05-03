import { RumiousRenderTemplate } from './template.js';
import { RumiousArrayState } from '../state/array.js';
import { RumiousRenderContext } from './context.js';
import { RumiousStateCommit } from '../state/reactor.js';
import { RumiousState, watch, unwatch } from '../state/state.js';

type RumiousListRenderFn = (item: any, index: any) => RumiousRenderTemplate;

export class RumiousListRenderer<T> {
  public anchorElement!: HTMLElement;
  public context!: RumiousRenderContext;

  constructor(
    public state: RumiousArrayState<T>,
    public callback: RumiousListRenderFn
  ) {}

  prepare(anchor: HTMLElement, context: RumiousRenderContext): void {
    this.anchorElement = anchor;
    this.context = context;
  }

  protected renderItem(value: T, index: number): DocumentFragment {
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
      ? this.anchorElement.insertBefore(frag, current)
      : this.anchorElement.appendChild(frag);
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

  async onStateChange(commit: RumiousStateCommit<typeof this.state.value>) {
    if (!document.contains(this.anchorElement)) {
      this.state.reactor.removeBinding(this.onStateChange.bind(this));
      return;
    }

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
        this.appendElement(
          commit.value,
          this.state.value.length - (commit.value as T[]).length
        );
        break;
      case 'PREPEND':
        this.anchorElement.prepend(this.renderItem(commit.value as T, 0));
        break;
      default:
        this.scheduleRenderAll();
    }
  }
}

export function renderList<T>(
  state: RumiousArrayState<T>,
  callback: RumiousListRenderFn
) {
  return new RumiousListRenderer<T>(state, callback);
}

export interface RumiousInfinityScrollRenderOptions<T> {
  data: RumiousArrayState<T>;
  template: RumiousListRenderFn;
  loader?: (limit: number, offset: number) => T[] | Promise<T[]>;
  scrollElement: HTMLElement | Window;
  state?: RumiousState<string>;
  controller?: RumiousState<string>;
  limit?: number;
  offset?: number;
  threshold: number;
}

export class RumiousInfinityScrollRenderer<T> extends RumiousListRenderer<T> {
  private limit: number;
  private offset: number;
  private isLoading = false;

  private onScroll: () => void;
  private onControl: () => void;
  private onChange: (commit: RumiousStateCommit<T[]>) => void;

  constructor(public options: RumiousInfinityScrollRenderOptions<T>) {
    super(options.data, options.template);
    this.limit = options.limit ?? 50;
    this.offset = options.offset ?? 0;

    this.onScroll = this.handleScroll.bind(this);
    this.onControl = this.handleControl.bind(this);
    this.onChange = this.handleStateChange.bind(this);
  }

  private setState(name: string) {
    this.options.state?.set(name);
  }

  private async fetchData(): Promise<T[]> {
    const data = (await this.options.loader?.(this.limit, this.offset)) ?? [];
    this.offset += data.length;
    return data;
  }

  private getScrollInfo() {
    const el = this.options.scrollElement;
    return el === window
      ? {
          scrollTop: window.scrollY,
          scrollHeight: document.documentElement.scrollHeight,
          clientHeight: window.innerHeight,
        }
      : {
          scrollTop: (el as HTMLElement).scrollTop,
          scrollHeight: (el as HTMLElement).scrollHeight,
          clientHeight: (el as HTMLElement).clientHeight,
        };
  }

  private async addData() {
    const anchorElement = this.options.scrollElement;
    this.isLoading = true;
    this.setState('START_FETCH');

    const newData = await this.fetchData();

    this.setState('END_FETCH');

    if (newData.length === 0) {
      this.setState('NO_DATA');
      anchorElement.removeEventListener('scroll', this.onScroll);
    } else {
      this.state.append(...newData);
    }

    this.isLoading = false;
  }

  private async handleScroll() {
    const { scrollTop, scrollHeight, clientHeight } = this.getScrollInfo();

    if (
      scrollTop + clientHeight >= scrollHeight - this.options.threshold &&
      !this.isLoading
    ) {
      await this.addData();
    }
  }

  private handleControl() {
    if (this.options?.controller?.get() === 'FETCH') {
      this.addData();
    }
  }

  private handleStateChange(commit: RumiousStateCommit<T[]>) {
    if (!document.contains(this.anchorElement)) {
      if (this.options.controller)
        unwatch(this.options.controller, this.onControl);
      this.state.reactor.removeBinding(this.onChange);
      return;
    }

    this.onStateChange(commit);
  }

  async render(): Promise<void> {
    const anchorElement = this.options.scrollElement;
    anchorElement.addEventListener('scroll', this.onScroll);

    if (this.options.controller) watch(this.options.controller, this.onControl);
    this.state.reactor.addBinding(this.onChange);

    this.scheduleRenderAll();
  }
}
export function createInfinityScroll<T>(
  options: RumiousInfinityScrollRenderOptions<T>
) {
  return new RumiousInfinityScrollRenderer(options);
}

export interface RumiousPagenationOptions<T> {
  data: RumiousArrayState<T>;
  template: RumiousListRenderFn;
  info?: RumiousState<object>;
  pages?: RumiousArrayState<{
    isRender: boolean;
    index: number;
  }>;
  controller: RumiousState<string>;
  size: number;
  page?: number;
}

export class RumiousPagenationRenderer<T> extends RumiousListRenderer<T> {
  private size: number;
  private currentPage: number;

  constructor(public options: RumiousPagenationOptions<T>) {
    super(options.data, options.template);
    this.size = options.size;
    this.currentPage = options.page ?? 0;
  }

  private getPageData(): T[] {
    const start = this.currentPage * this.size;
    const end = start + this.size;
    return this.state.value.slice(start, end);
  }

  private renderPage() {
    const frag = document.createDocumentFragment();
    const start = this.currentPage * this.size;
    const end = start + this.size;
    this.state.value.slice(start, end).forEach((value, i) => {
      frag.appendChild(this.renderItem(value, start + i));
    });
    this.anchorElement.replaceChildren(frag);
    this.calculate();
  }

  goToPage(page: number) {
    const maxPage = Math.floor(this.state.value.length / this.size);
    console.log(maxPage);
    this.currentPage = Math.max(0, Math.min(page, maxPage));
    this.renderPage();
  }

  nextPage() {
    this.goToPage(this.currentPage + 1);
  }

  prevPage() {
    this.goToPage(this.currentPage - 1);
  }

  onControl({ value }: { value: unknown }) {
    switch (value) {
      case 'NEXT':
        this.nextPage();
        break;

      case 'PREV':
        this.prevPage();
        break;
    }
  }

  async calculate() {
    if (this.options.info) {
      this.options.info.set({
        current: this.currentPage,
        size: this.options.size,
      });
    }

    if (this.options.pages) {
      const maxPage = Math.floor(this.state.value.length / this.size);
      let pages = [];
      for (var i = 0; i < maxPage; i++) {
        pages.push({
          isRender: this.currentPage === i,
          index: i,
        });
      }

      this.options.pages.set(pages);
    }
  }

  async render(): Promise<void> {
    watch(this.options.controller, this.onControl.bind(this));
    this.options.controller;
    this.state.reactor.addBinding(this.onStateChange.bind(this));
    this.renderPage();
  }

  async onStateChange(commit: RumiousStateCommit<typeof this.state.value>) {
    if (!document.contains(this.anchorElement)) {
      unwatch(this.options.controller, this.onControl.bind(this));
      this.state.reactor.removeBinding(this.onStateChange.bind(this));
      return;
    }
    const start = this.currentPage * this.size;
    const end = start + this.size;

    const isInCurrentPage = (index: number) => index >= start && index < end;
    switch (commit.type) {
      case 'SET':
        this.currentPage = 0;
        this.renderPage();
        break;

      case 'SET_BY_KEY':
      case 'REMOVE_BY_KEY':
      case 'INSERT_BY_KEY':
        if (isInCurrentPage(commit.key as number)) {
          this.renderPage();
        }
        break;

      case 'APPEND':
        const total = this.state.value.length;
        const lastPage = Math.floor((total - 1) / this.size);
        if (this.currentPage === lastPage) {
          this.renderPage();
        }
        break;

      case 'PREPEND':
        this.renderPage();
        break;

      default:
        this.renderPage();
    }
  }
}

export function createPagination<T>(options: RumiousPagenationOptions<T>) {
  return new RumiousPagenationRenderer<T>(options);
}
