const { describe, expect } = require('testious');
const {
  RumiousComponent,
  RumiousRenderContext,
  createComponentElement,
  createApp
} = require('../../packages/core/dist/index.js');

describe("RumiousComponent testing ", (group) => {
  const rootElement = document.createElement("span");
  const app = createApp({
    root: rootElement
  });
  
  const calls = [];
  class TestComponent extends RumiousComponent {
    constructor() {
      super();
    }
    
    template() {
      return (root, context) => {
        const el = document.createElement("h1");
        el.textContent = "Hello Component";
        root.appendChild(el);
      }
    }
    
    beforeRender() {
      calls.push("beforeRender");
    }
    
    onCreate() {
      calls.push("create");
    }
    
    onRender() {
      calls.push("render");
    }
    
    onDestroy() {
      calls.push("destroy");
    }
  }
  
  const [element] = createComponentElement(
    app.context,
    TestComponent, { test: "ok" }
  );
  
  group.it("Component rendering ", async () => {
    rootElement.appendChild(element);
    expect(element).toBeInstanceOf(HTMLElement);
    // Simulate component DOM rendering
    await element.connectedCallback();
    expect(element.instance).toBeInstanceOf(RumiousComponent);
    expect(element.instance.context).toBeInstanceOf(RumiousRenderContext);
  });
  
  group.it("Component props passing ", async () => {
    expect(element.instance.props).toEqual({
      test: "ok"
    });
  });
  
  group.it("Called onCreate when component create", async () => {
    expect(calls).toContain("create");
  });
  
  group.it("Called beforeRender before render component ", async () => {
    expect(calls).toContain("beforeRender");
  });
  
  group.it("Called onRender when component render finish", async () => {
    expect(calls).toContain("render");
  });
  
  group.it("Mouting template ", async () => {
    let mountEle = document.createElement("span");
    element.instance.mountTo(
      (root, context) => {
        const el = document.createElement("h1");
        el.textContent = "Hello";
        root.appendChild(el);
      },
      mountEle
    );
    
    expect(mountEle.innerHTML).toContain("<h1>Hello</h1>");
  });
  
  group.it("Called onDestroy when component destroy", async () => {
    await element.disconnectedCallback();
    expect(calls).toContain("destroy");
  });
  
});