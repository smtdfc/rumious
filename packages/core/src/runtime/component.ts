import {
  Component,
  type ForProps,
  type FunctionComponent,
} from "../component/component.js";
import { flushQueue } from "../effect/index.js";
import { State, type ArrayMutationEvent } from "../state/state.js";
import { Context, getContext, withCurrentContext } from "./context.js";
import { $$effect } from "./effect.js";
import { $$createRange, $$insertInRange } from "./range.js";
import { $$createRenderer, type Renderer } from "./renderer.js";

export type ComponentFunc<T> = (
  props: T,
  ins: Component,
  ctx?: Context,
) => Renderer;
export function $$createComponent<T>(
  node: Node,
  parentCtx: Context,
  component: ComponentFunc<T>,
  props: T,
) {
  const range = $$createRange(node);
  let instance = new Component(parentCtx);
  let ctx = getContext(instance);

  let renderer!: Renderer;
  withCurrentContext(ctx, () => {
    renderer = component(props, instance, ctx);
  });

  withCurrentContext(ctx, () => {
    $$insertInRange(range, renderer.render(ctx), ctx);

    const defs = ctx.deferrers;
    for (let i = 0; i < defs.length; i++) {
      defs[i]?.();
    }

    ctx.deferrers = [];
  });

  flushQueue();
}

export function $$forComponent<T>(
  node: Node,
  parentCtx: Context,
  props: ForProps<T>,
) {
  const range = $$createRange(node);
  const template = props.template;
  const data = props.data;

  type ForEntry = {
    key: any;
    index: number;
    instance: Component;
    state: State<T>;
    start: Comment;
    end: Comment;
  };

  let entries: ForEntry[] = [];

  const getKey = (item: T, index: number) => {
    if (props.keyer) {
      return props.keyer(item, index);
    }

    return item;
  };

  const runDeferrers = (instance: Component) => {
    const ctx = getContext(instance);
    withCurrentContext(ctx, () => {
      const defs = ctx.deferrers;
      for (let i = 0; i < defs.length; i++) {
        defs[i]?.();
      }
      ctx.deferrers = [];
    });
  };

  const removeEntry = (entry: ForEntry, parent: Node) => {
    entry.instance.clean();

    const childIndex = parentCtx.childrens.indexOf(entry.instance);
    if (childIndex >= 0) {
      parentCtx.childrens.splice(childIndex, 1);
    }

    let current: Node | null = entry.start;
    while (current) {
      const next = current.nextSibling;
      parent.removeChild(current);
      if (current === entry.end) {
        break;
      }
      current = next;
    }
  };

  const moveEntryBefore = (entry: ForEntry, parent: Node, before: Node) => {
    if (entry.end.nextSibling === before) {
      return;
    }

    const frag = document.createDocumentFragment();
    let current: Node | null = entry.start;
    while (current) {
      const next = current.nextSibling;
      frag.appendChild(current);
      if (current === entry.end) {
        break;
      }
      current = next;
    }

    parent.insertBefore(frag, before);
  };

  const createEntry = (
    parent: Node,
    before: Node,
    item: T,
    key: any,
    index: number,
  ): ForEntry => {
    const itemStart = new Comment("f:s");
    const itemEnd = new Comment("f:e");
    const instance = new Component(parentCtx);
    const itemState = new State(item);
    const ctx = getContext(instance);
    let renderer!: Renderer;

    withCurrentContext(ctx, () => {
      renderer = template({ data: itemState, index }, instance, ctx);
    });

    withCurrentContext(ctx, () => {
      parent.insertBefore(itemStart, before);
      parent.insertBefore(renderer.render(ctx), before);
      parent.insertBefore(itemEnd, before);
      runDeferrers(instance);
    });

    return {
      key,
      index,
      instance,
      state: itemState,
      start: itemStart,
      end: itemEnd,
    };
  };

  const reindexFrom = (start: number) => {
    for (let i = start; i < entries.length; i++) {
      entries[i]!.index = i;
    }
  };

  const insertEntryAt = (index: number, item: T) => {
    const parent = range.start.parentNode;
    if (!parent) {
      return false;
    }

    const before = index < entries.length ? entries[index]!.start : range.end;
    const entry = createEntry(parent, before, item, getKey(item, index), index);
    entries.splice(index, 0, entry);
    reindexFrom(index + 1);
    return true;
  };

  const removeEntryAt = (index: number) => {
    const parent = range.start.parentNode;
    if (!parent) {
      return false;
    }

    if (index < 0 || index >= entries.length) {
      return false;
    }

    const target = entries[index]!;
    removeEntry(target, parent);
    entries.splice(index, 1);
    reindexFrom(index);
    return true;
  };

  const swapEntriesAt = (indexA: number, indexB: number) => {
    const parent = range.start.parentNode;
    if (!parent) {
      return false;
    }

    if (
      indexA < 0 ||
      indexA >= entries.length ||
      indexB < 0 ||
      indexB >= entries.length
    ) {
      return false;
    }

    if (indexA === indexB) {
      return true;
    }

    let firstIndex = indexA;
    let secondIndex = indexB;
    if (firstIndex > secondIndex) {
      const temp = firstIndex;
      firstIndex = secondIndex;
      secondIndex = temp;
    }

    const first = entries[firstIndex]!;
    const second = entries[secondIndex]!;
    const secondNext = second.end.nextSibling ?? range.end;

    moveEntryBefore(second, parent, first.start);
    moveEntryBefore(first, parent, secondNext);

    entries[firstIndex] = second;
    entries[secondIndex] = first;
    entries[firstIndex]!.index = firstIndex;
    entries[secondIndex]!.index = secondIndex;

    return true;
  };

  const applyArrayMutations = (
    mutations: ArrayMutationEvent<T>[],
    snapshot: T[],
  ) => {
    for (let i = 0; i < mutations.length; i++) {
      const mutation = mutations[i]!;

      if (mutation.type === "append") {
        if (!insertEntryAt(entries.length, mutation.value)) {
          return false;
        }
        continue;
      }

      if (mutation.type === "prepend") {
        if (!insertEntryAt(0, mutation.value)) {
          return false;
        }
        continue;
      }

      if (mutation.type === "insert") {
        if (!insertEntryAt(mutation.index, mutation.value)) {
          return false;
        }
        continue;
      }

      if (mutation.type === "remove") {
        if (!removeEntryAt(mutation.index)) {
          return false;
        }
        continue;
      }

      if (mutation.type === "setByIndex") {
        if (mutation.index < 0 || mutation.index >= entries.length) {
          return false;
        }

        const target = entries[mutation.index]!;
        target.state.set(mutation.value);
        target.key = getKey(mutation.value, mutation.index);
        continue;
      }

      if (mutation.type === "swap") {
        if (!swapEntriesAt(mutation.indexA, mutation.indexB)) {
          return false;
        }
      }
    }

    return entries.length === snapshot.length;
  };

  const reconcile = (items: T[]) => {
    const parent = range.start.parentNode;
    if (!parent) {
      return;
    }

    const buckets = new Map<any, ForEntry[]>();
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i]!;
      const bucket = buckets.get(entry.key);
      if (bucket) {
        bucket.push(entry);
      } else {
        buckets.set(entry.key, [entry]);
      }
    }

    const nextEntries: ForEntry[] = new Array(items.length);
    let cursor: Node = range.end;

    for (let i = items.length - 1; i >= 0; i--) {
      const item = items[i]!;
      const key = getKey(item, i);
      const bucket = buckets.get(key);
      let entry = bucket?.shift();

      if (!entry) {
        entry = createEntry(parent, cursor, item, key, i);
      } else {
        entry.state.set(item);
      }

      entry.index = i;
      moveEntryBefore(entry, parent, cursor);

      nextEntries[i] = entry;
      cursor = entry.start;
    }

    for (const bucket of buckets.values()) {
      for (let i = 0; i < bucket.length; i++) {
        removeEntry(bucket[i]!, parent);
      }
    }

    entries = nextEntries;
    flushQueue();
  };

  parentCtx.cleanups.push(() => {
    const parent = range.start.parentNode;
    if (!parent) {
      entries = [];
      return;
    }

    for (let i = 0; i < entries.length; i++) {
      removeEntry(entries[i]!, parent);
    }

    entries = [];
  });

  if (data instanceof State) {
    $$effect(
      () => {
        const snapshot = data.get() ?? [];
        const mutations = data.drainArrayMutations() as ArrayMutationEvent<T>[];

        if (mutations.length > 0 && applyArrayMutations(mutations, snapshot)) {
          flushQueue();
          return;
        }

        reconcile(snapshot);
      },
      [data],
      parentCtx,
    );
    return;
  }

  reconcile(data);
}

export function $$ifComponent(
  node: Node,
  parentCtx: Context,
  condition: boolean | State<boolean> | (() => boolean),
  thenBranch: FunctionComponent<any> | null | undefined,
  fallbackBranch: FunctionComponent<any> | null | undefined,
  deps: State<any>[] = [],
) {
  const range = $$createRange(node);
  const watchedDeps =
    condition instanceof State && deps.indexOf(condition) < 0
      ? [condition, ...deps]
      : deps;

  $$effect(
    () => {
      const value =
        condition instanceof State
          ? condition.get()
          : typeof condition === "function"
            ? condition()
            : condition;
      const branch = value ? thenBranch : fallbackBranch;

      const content = branch
        ? $$createRenderer((ctx) => {
            const instance = new Component(ctx);
            const branchCtx = getContext(instance);

            let renderer!: Renderer;
            withCurrentContext(branchCtx, () => {
              renderer = branch({}, instance, branchCtx);
            });

            const fragment = withCurrentContext(branchCtx, () => {
              const rendered = renderer.render(branchCtx);

              const defs = branchCtx.deferrers;
              for (let i = 0; i < defs.length; i++) {
                defs[i]?.();
              }
              branchCtx.deferrers = [];

              return rendered;
            });

            return fragment;
          })
        : null;

      $$insertInRange(range, content, parentCtx);
    },
    watchedDeps,
    parentCtx,
  );
}
