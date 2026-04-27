import { expect, test } from "vitest";
import {
  $$ifComponent,
  type Component,
  type FunctionComponent,
  $$createRenderer,
  Context,
  createState,
  flushQueue,
} from "../dist";

function createTextComponent(text: string): FunctionComponent<any> {
  return (_props: any, _ins?: Component) =>
    $$createRenderer(() => {
      const fragment = document.createDocumentFragment();
      fragment.appendChild(document.createTextNode(text));
      return fragment;
    });
}

test("$$ifComponent swaps branches when condition changes", () => {
  const host = document.createElement("div");
  const marker = document.createComment("if");
  host.appendChild(marker);

  const state = createState(true);
  const ctx = new Context();

  $$ifComponent(
    marker,
    ctx,
    state,
    createTextComponent("on"),
    createTextComponent("off"),
    [state],
  );

  for (const deferrer of ctx.deferrers) {
    deferrer?.();
  }
  ctx.deferrers = [];

  flushQueue();
  expect(host.textContent).toBe("on");

  state.set(false);
  flushQueue();
  expect(host.textContent).toBe("off");

  ctx.clean();
});

test("$$ifComponent recomputes function condition with deps", () => {
  const host = document.createElement("div");
  const marker = document.createComment("if-fn");
  host.appendChild(marker);

  const count = createState(0);
  const ctx = new Context();

  $$ifComponent(
    marker,
    ctx,
    () => count.get() > 0,
    createTextComponent("on"),
    createTextComponent("off"),
    [count],
  );

  for (const deferrer of ctx.deferrers) {
    deferrer?.();
  }
  ctx.deferrers = [];

  flushQueue();
  expect(host.textContent).toBe("off");

  count.set(2);
  flushQueue();
  expect(host.textContent).toBe("on");

  ctx.clean();
});
