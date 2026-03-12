import { expect, test, vi } from "vitest";
import { $$createRenderer, $$createTemplate } from "../dist";
import { Renderer } from "../dist";
import type { Context } from "../dist";

test("$$createRenderer must be return", () => {
  let renderer = $$createRenderer((ctx) => document.createDocumentFragment());
  expect(renderer).instanceOf(Renderer);
});

test("Renderer function called", () => {
  const cb = vi.fn();
  let renderer = $$createRenderer((ctx) => {
    cb();
    return document.createDocumentFragment();
  });

  renderer.render({} as Context);
  expect(renderer).instanceOf(Renderer);
  expect(cb).toHaveBeenCalled();
});

test("Render context arg passed", () => {
  const ctx = {} as Context;
  const cb = vi.fn();
  let renderer = $$createRenderer((ctx) => {
    cb(ctx);
    return document.createDocumentFragment();
  });

  renderer.render(ctx);
  expect(renderer).instanceOf(Renderer);
  expect(cb).toHaveBeenCalled();
  expect(cb).toHaveBeenCalledWith(ctx);
});

test("$$createTemplate must be return", () => {
  let template = $$createTemplate("<h1>Hello</h1>");
  expect(template).instanceOf(HTMLTemplateElement);
});
