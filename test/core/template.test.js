const { describe, expect } = require('testious');
const {
  RumiousComponent,
  RumiousRenderContext,
  RumiousState,
  createDynamicValue,
  createTemplate,
  createComponent,
  element,
  createEvent,
  createState,
  createApp
} = require('../../packages/core/dist/index.js');



describe("Rumious Template testing", (group) => {
  const rootElement = document.createElement("span");
  const app = createApp({
    root: rootElement
  });
  
  group.it("createComponent() working ", () => {
    class TestComponent extends RumiousComponent {
      static tagName = "test-component";
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
    }
    
    const [element] = createComponent(
      rootElement,
      app.context,
      TestComponent, { test: "ok" }
    );
    
    expect(element).toBeInstanceOf(HTMLElement);
    expect(element.props).toEqual({
      test: "ok"
    });
  });
  
  group.it("createDynamicValue() working ", () => {
    expect(createDynamicValue(
      app.context,
      "hello"
    )).toBeInstanceOf(window.Text);
    
    expect(createDynamicValue(
      app.context,
      createState("hello")
    )).toBeInstanceOf(window.Text);
    expect(app.context.onRendered).toHaveLength(1);
    app.context.onRendered = [];
    
    expect(createDynamicValue(
      app.context,
      createState("hello")
    )).toBeInstanceOf(window.Text);
    expect(app.context.onRendered).toHaveLength(1);
    app.context.onRendered = [];
    
    createDynamicValue(
      app.context,
      createTemplate((r, c) => {
        expect(r).toBeInstanceOf(window.DocumentFragment);
        expect(c).toBeInstanceOf(RumiousRenderContext);
      })
    )
    
    expect(createDynamicValue(
      app.context,
      [1, 2, 3]
    )).toBeInstanceOf(window.DocumentFragment);
    
  });
  
  group.it("element() working ", () => {
    expect(element(
      document.createElement("div"),
      "a"
    )).toBeInstanceOf(HTMLElement)
  });
  
  group.it("createEvent() working ", () => {
    function eventCallback() {}
    let ele = document.createElement("div")
    createEvent(
      ele,
      "click",
      eventCallback
    )
    expect(ele).toHaveKeys(['__rumiousEvents'])
  });
  
  group.it("createTemplate() working ", () => {
    expect(createTemplate((r, c) => null)).toBeFunction();
  });
  
});