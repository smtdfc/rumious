/*

export class RumiousListRender < T > {
  public view = new RumiousViewControl();
  public template!: (data: T) => RumiousTemplate;
  
  constructor(
    public data: RumiousListState < T > ,
    public limit: number = 10,
    public offset: number = 1
  ) {
    if (this.limit <= 0) throw new Error("Limit must be greater than 0");
    watch(data, this.onStateChange.bind(this));
  }
  
  
  get totalPages(): number {
    const len = this.data.get().length;
    return this.limit > 0 ? Math.ceil(len / this.limit) : 1;
  }
  
  get currentPage(): number {
    return Math.max(1, Math.min(this.offset, this.totalPages));
  }
  
  get hasNext(): boolean {
    return this.currentPage < this.totalPages;
  }
  
  get hasPrev(): boolean {
    return this.currentPage > 1;
  }
  
  goToPage(page: number) {
    this.offset = Math.max(1, Math.min(page, this.totalPages));
    this.render();
  }
  
  nextPage() {
    this.goToPage(this.currentPage + 1);
  }
  
  prevPage() {
    this.goToPage(this.currentPage - 1);
  }
  
  private calcPos(): [number, number] {
    const length = this.data.get().length;
    const start = this.limit * (this.currentPage - 1);
    const end = Math.min(start + this.limit, length);
    return [start, end];
  }
  
  render() {
    const [start, end] = this.calcPos();
    const dataSlice = this.data.get().slice(start, end);
    
    this.view.each(({ element, context }) => {
      element.textContent = '';
      
      const fragment = document.createDocumentFragment();
      for (const d of dataSlice) {
        fragment.appendChild(render(
          this.template(d),
          document.createDocumentFragment(),
          context
        ));
      }
      
      element.appendChild(fragment);
    });
  }
  
  private onStateChange(commit: RumiousChangeCommit < RumiousListState < T >> ) {
    switch (commit.type) {
      case 'set':
      case 'append':
      case 'prepend':
        this.render();
        break;
        
      case 'update':
        this.updateItem(commit.key, commit.value);
        break;
        
      case 'remove':
        this.removeItem(commit.key);
        break;
        
      case 'insert':
        this.insertItem(commit.key, commit.value);
        break;
    }
  }
  
  private updateItem(key: number, value: T) {
    const [start, end] = this.calcPos();
    if (key < start || key >= end) return;
    
    const replacePos = key - start;
    
    this.view.each(({ element, context }) => {
      const oldChild = element.children[replacePos];
      if (!oldChild) return;
      
      const newVNode = this.template(value);
      const newChild = render(
        newVNode,
        document.createDocumentFragment(),
        context
      ).firstChild;
      
      if (newChild) {
        element.replaceChild(newChild, oldChild);
      }
    });
  }
  
  
  private removeItem(key: number) {
    const [start, end] = this.calcPos();
    if (key < start || key >= end) return;
    
    const removePos = key - start;
    const fullData = this.data.get();
    
    this.view.each(({ element, context }) => {
      const toRemove = element.children[removePos];
      if (toRemove) element.removeChild(toRemove);
      
      for (let i = removePos + 1; i < element.children.length + 1; i++) {
        const dataIndex = start + i;
        if (dataIndex >= fullData.length) {
          break;
        }
        
        const newNode = render(
          this.template(fullData[dataIndex]),
          document.createDocumentFragment(),
          context
        ).firstChild;
        
        if (!newNode) continue;
        
        if (element.children[i - 1]) {
          element.replaceChild(newNode, element.children[i - 1]);
        } else {
          element.appendChild(newNode);
        }
      }
    });
  }
  
  private insertItem(key: number, value: T) {
    const [start, end] = this.calcPos();
    if (key < start || key >= end) return;
    
    const insertPos = key - start;
    const fullData = this.data.get();
    
    this.view.each(({ element, context }) => {
      const newNode = render(
        this.template(value),
        document.createDocumentFragment(),
        context
      ).firstChild;
      
      if (!newNode) return;
      
      if (insertPos >= element.children.length) {
        element.appendChild(newNode);
      } else {
        element.insertBefore(newNode, element.children[insertPos]);
      }
      
      if (element.children.length > this.limit) {
        element.removeChild(element.lastChild!);
      }
    });
  }
}

const resolveCache = new Map();

function resolve(templ, path) {
  const key = path.join(',');
  if (resolveCache.has(key)) {
    return resolveCache.get(key);
  }

  let current = templ;
  for (let idx of path) {
    current = current.childNodes[idx];
  }

  resolveCache.set(key, current);
  return current;
}

*/