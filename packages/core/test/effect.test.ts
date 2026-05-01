import { expect, test, vi } from "vitest";
import {
  $$createRenderer,
  Context,
  createApp,
  createEffect,
  createState,
  flushQueue,
} from "../dist";

test("createEffect reruns cleanup when deps change and on destroy", () => {
  const host = document.createElement("div");
  const app = createApp(host);
  const count = createState(0);
  const runs = vi.fn();
  const cleanups: string[] = [];

  app.attach(
    $$createRenderer(() => {
      createEffect(() => {
        const value = count.get();
        runs(value);

        return () => {
          cleanups.push(`cleanup:${value}`);
        };
      }, [count]);

      return document.createDocumentFragment();
    }),
  );

  flushQueue();
  expect(runs).toHaveBeenCalledTimes(1);
  expect(runs).toHaveBeenLastCalledWith(0);
  expect(cleanups).toEqual([]);

  count.set(1);
  flushQueue();

  expect(runs).toHaveBeenCalledTimes(2);
  expect(runs).toHaveBeenLastCalledWith(1);
  expect(cleanups).toEqual(["cleanup:0"]);

  app.destroy();
  expect(cleanups).toEqual(["cleanup:0", "cleanup:1"]);
});

test("createEffect accepts an explicit ctx argument", () => {
  const ctx = new Context();
  const count = createState(0);
  const runs = vi.fn();

  createEffect(
    () => {
      runs(count.get());
    },
    [count],
    ctx,
  );

  expect(ctx.deferrers).toHaveLength(1);

  for (const deferrer of ctx.deferrers) {
    deferrer?.();
  }
  ctx.deferrers = [];

  flushQueue();
  expect(runs).toHaveBeenCalledTimes(1);
  expect(runs).toHaveBeenLastCalledWith(0);
});
