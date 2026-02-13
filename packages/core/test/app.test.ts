import { describe, it, expect, vi, beforeEach } from "vitest";
import { App } from "../dist/index.js";
import { component } from "../src/component";
import { BaseComponentElement } from "../src/runtime";

describe("App Entry Point", () => {
  let root: HTMLElement;
  let app: App;

  beforeEach(() => {
    root = document.createElement("div");
    root.id = "app";
    document.body.appendChild(root);
    app = new App();
  });

  it("should attach a component to the root element", () => {
    const MyComponent = component(() => {
      const frag = document.createDocumentFragment();
      const h1 = document.createElement("h1");
      h1.textContent = "Hello Rumious";
      frag.appendChild(h1);
      return { render: () => frag }; // Mock renderer
    }, "app-test-attach");

    app.attach(root, MyComponent as any);

    const mountedElement = root.firstElementChild;
    expect(mountedElement).toBeInstanceOf(BaseComponentElement);
    expect(mountedElement?.tagName.toLowerCase()).toBe("app-test-attach");
  });

  it("should trigger Custom Element lifecycle when attached", async () => {
    const factorySpy = vi.fn(() => ({
      render: () => document.createDocumentFragment(),
    }));

    const MyComponent = component(factorySpy, "app-test-lifecycle");

    app.attach(root, MyComponent as any);

    await new Promise((res) => setTimeout(res, 0));

    expect(factorySpy).toHaveBeenCalled();
  });
});
