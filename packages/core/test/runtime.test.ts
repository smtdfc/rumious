import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  $$template,
  $$clone,
  $$walk,
  $$range,
  $$text,
  defineComponentElement,
  $$createRenderer,
  Context,
} from "../dist/index.js";
import { ComponentLifecycle } from "../dist/index.js";

describe("Rumious Runtime Engine", () => {
  describe("Template & DOM Operations", () => {
    it("$$template should create a template element with correct HTML", () => {
      const html = "<div><span>test</span></div>";
      const template = $$template(html);
      expect(template).toBeInstanceOf(HTMLTemplateElement);
      expect(template.innerHTML).toBe(html);
    });

    it("$$clone should return a deep clone of template content", () => {
      const template = $$template("<p>hello</p>");
      const clone = $$clone(template) as DocumentFragment;
      expect(clone.textContent).toBe("hello");
      expect(clone).not.toBe(template.content); // Must be a new instance
    });

    it("$$walk should navigate correctly using 'f' and 's' paths", () => {
      const template = $$template("<a></a><b></b><c><i></i></c>");
      const clone = $$clone(template) as DocumentFragment;

      // path 'ff' -> firstChild (a) -> firstChild (null) -> Error
      // path 'fs' -> firstChild (a) -> nextSibling (b)
      const nodeB = $$walk(clone, "fs");
      expect(nodeB.tagName.toLowerCase()).toBe("b");

      const nodeI = $$walk(clone, "fssf"); // div -> a -> b -> c -> i
      expect(nodeI.tagName.toLowerCase()).toBe("i");
    });
  });

  describe("Reactivity Helpers (Range & Text)", () => {
    let ctx: Context;
    let container: HTMLElement;

    beforeEach(() => {
      ctx = new Context(new ComponentLifecycle());
      container = document.createElement("div");
    });

    it("$$range should insert comment markers around a node", () => {
      const target = document.createElement("span");
      container.appendChild(target);

      const range = $$range(target, "test-key", ctx);

      expect(container.childNodes[0]!.nodeType).toBe(Node.COMMENT_NODE); // start
      expect(container.childNodes[1]).toBe(target);
      expect(container.childNodes[2]!.nodeType).toBe(Node.COMMENT_NODE); // end
      expect(range.start.textContent).toContain("range-start:test-key");
    });

    it("$$text should update text content within a range", () => {
      const target = document.createElement("span");
      container.appendChild(target);
      const range = $$range(target, "k", ctx);

      // Initial update
      $$text(range, "Hello", ctx);
      expect(container.textContent).toBe("Hello");

      // Differential update
      $$text(range, "World", ctx);
      expect(container.textContent).toBe("World");

      // Clear extra nodes if any
      const extra = document.createTextNode(" Extra");
      container.insertBefore(extra, range.end);
      $$text(range, "Clean", ctx);
      expect(container.textContent).toBe("Clean");
      expect(container.childNodes.length).toBe(3); // start, text, end
    });
  });

  describe("Custom Element System", () => {
    it("defineComponentElement should register and mount a component", async () => {
      const tagName = "test-comp-" + Math.random().toString(36).slice(2);
      const factory = vi.fn((lc, props) =>
        $$createRenderer((ctx) => {
          const frag = document.createDocumentFragment();
          const el = document.createElement("h1");
          el.textContent = "Mounted: " + props.name;
          frag.appendChild(el);
          return frag;
        }),
      );

      const { ComponentElement } = defineComponentElement(factory, tagName);

      const instance = new ComponentElement();
      (instance as any).__props = { name: "Rumious" };

      document.body.appendChild(instance);

      // Wait for lifecycle (connectedCallback)
      expect(factory).toHaveBeenCalled();
      expect(instance.innerHTML).toContain("Mounted: Rumious");

      document.body.removeChild(instance);
    });
  });
});
