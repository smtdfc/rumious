import { expect, test } from "vitest";
import {
  $$createRenderer,
  $$forComponent,
  Context,
  createState,
  flushQueue,
  type Component,
  type Renderer,
  type State,
} from "../src/index";

type Row = {
  id: number;
  label: string;
};

type ScenarioResult = {
  scenario: string;
  operations: number;
  totalMs: number;
  avgMs: number;
};

function makeRows(count: number, startId = 0): Row[] {
  const out = new Array<Row>(count);
  for (let i = 0; i < count; i++) {
    const id = startId + i;
    out[i] = { id, label: `row-${id}` };
  }
  return out;
}

function measure(
  label: string,
  operations: number,
  run: () => void,
): ScenarioResult {
  const t0 = performance.now();
  run();
  const totalMs = performance.now() - t0;
  return {
    scenario: label,
    operations,
    totalMs,
    avgMs: totalMs / operations,
  };
}

function shuffleRows(rows: Row[]): Row[] {
  const out = rows.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    const temp = out[i]!;
    out[i] = out[j]!;
    out[j] = temp;
  }
  return out;
}

function mountForList(state: State<Row[]>) {
  const host = document.createElement("div");
  const marker = document.createComment("for");
  host.appendChild(marker);

  const ctx = new Context();

  const template = (
    props: { data: State<Row>; index: number },
    _ins?: Component,
  ): Renderer =>
    $$createRenderer(() => {
      const frag = document.createDocumentFragment();
      const row = props.data.get();
      const item = document.createElement("div");
      item.textContent = `${row.id}:${props.index}`;
      frag.appendChild(item);
      return frag;
    });

  $$forComponent(marker, ctx, {
    data: state,
    template,
    keyer: (item) => item.id,
  });

  flushQueue();

  return {
    host,
    destroy() {
      ctx.clean();
    },
  };
}

test("for keyed reconcile perf scenarios", () => {
  const initialSize = 1000;
  const opCount = 300;

  const state = createState(makeRows(initialSize));
  const mounted = mountForList(state);

  let nextId = initialSize;
  const results: ScenarioResult[] = [];

  results.push(
    measure("append", opCount, () => {
      for (let i = 0; i < opCount; i++) {
        state.append({ id: nextId, label: `row-${nextId}` });
        nextId++;
        flushQueue();
      }
    }),
  );

  results.push(
    measure("prepend", opCount, () => {
      for (let i = 0; i < opCount; i++) {
        state.prepend({ id: nextId, label: `row-${nextId}` });
        nextId++;
        flushQueue();
      }
    }),
  );

  results.push(
    measure("setByIndex-middle", opCount, () => {
      for (let i = 0; i < opCount; i++) {
        const mid = (state.get().length / 2) | 0;
        const prev = state.get()[mid]!;
        state.setByIndex(mid, { ...prev, label: `${prev.label}-u${i}` });
        flushQueue();
      }
    }),
  );

  results.push(
    measure("insert-remove-middle", opCount, () => {
      for (let i = 0; i < opCount; i++) {
        const mid = (state.get().length / 2) | 0;
        state.insert(mid, { id: nextId, label: `row-${nextId}` });
        nextId++;
        flushQueue();
        state.remove(mid);
        flushQueue();
      }
    }),
  );

  results.push(
    measure("reverse", 20, () => {
      for (let i = 0; i < 20; i++) {
        state.set(state.get().slice().reverse());
        flushQueue();
      }
    }),
  );

  results.push(
    measure("shuffle", 20, () => {
      for (let i = 0; i < 20; i++) {
        state.set(shuffleRows(state.get()));
        flushQueue();
      }
    }),
  );

  results.push(
    measure("replace-all-same-size", 20, () => {
      for (let i = 0; i < 20; i++) {
        const size = state.get().length;
        state.set(makeRows(size, nextId));
        nextId += size;
        flushQueue();
      }
    }),
  );

  console.table(
    results.map((r) => ({
      scenario: r.scenario,
      operations: r.operations,
      totalMs: r.totalMs.toFixed(2),
      avgMs: r.avgMs.toFixed(4),
    })),
  );

  expect(results.length).toBe(7);
  expect(mounted.host.childNodes.length).toBeGreaterThan(0);

  mounted.destroy();
});
