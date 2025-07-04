const { describe, expect } = require('testious');
const { createApp, RumiousApp, RumiousRenderContext } = require('../../packages/core/dist/index.js');

describe("Rumious App testing", (group) => {
  const rootElement = document.createElement("span");
  const app = createApp({
    root: rootElement
  });
  
  group.it("createApp working", (ctx) => {
    expect(app).toBeInstanceOf(RumiousApp);
  });
  
  group.it("RumiousModule working", (ctx) => {
    class TestModule {
      static init(app_, opts) {
        expect(app_).toBeInstanceOf(RumiousApp);
        expect(opts).toEqual({});
      }
    }
    
    const module = app.addModule(TestModule, {});
    expect(app).toBeInstanceOf(RumiousApp);
  });
  
  group.it("Rumious app rendering ", (ctx) => {
    app.render((root, context) => {
      expect(root).toBeInstanceOf(HTMLElement);
      expect(context).toBeInstanceOf(RumiousRenderContext);
      const el = document.createElement("h1");
      el.textContent = "Hello";
      root.appendChild(el);
    });
    
    expect(rootElement.innerHTML).toContain("<h1>Hello</h1>");
  });
  
});