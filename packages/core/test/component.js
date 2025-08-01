import { describe, expect } from 'testious';
import {
  Component,
  RenderContext,
  createComponentElement
} from '../dist/index.js';


describe("Rumious component test", (group) => {
  
  let componentTestMock = {
    propsPassed: false,
    elementMounted: false,
    renderCtxCreated: false,
    beforeMountCall: false,
    onCreateCall: false,
    onRenderCall: false,
    onDestroyCall: false,
    rendered: false
  }
  
  let element;
  
  class TestComponent extends Component {
    constructor(props, ele, parent) {
      super(props, ele, parent);
      componentTestMock.propsPassed = props === testProps;
      componentTestMock.elementMounted = ele instanceof HTMLElement;
      componentTestMock.renderCtxCreated = this.renderContext != null;
    }
    
    beforeMount() {
      componentTestMock.beforeMountCall = true;
    }
    
    onCreate() {
      componentTestMock.onCreateCall = true;
    }
    
    onRender() {
      componentTestMock.onRenderCall = true;
    }
    
    onDestroy() {
      componentTestMock.onDestroyCall = true;
    }
    
    template() {
      return (ctx) => {
        componentTestMock.rendered = true;
        let frag = document.createDocumentFragment();
        return frag;
      }
    }
  }
  
  let testProps = {
    test: "ok"
  };
  
  let renderCtx = new RenderContext()
  element = createComponentElement(
    TestComponent,
    renderCtx,
    testProps,
  );
  
  group.it("createComponentElement works", () => {
    expect(element).toBeInstanceOf(HTMLElement);
  });
  
  group.it("Component initialized ", () => {
    expect(componentTestMock.propsPassed).toEqual(true);
    expect(componentTestMock.renderCtxCreated).toEqual(true);
    expect(componentTestMock.elementMounted).toEqual(true);
  });
  
  group.it("Component.beforeMount called", () => {
    expect(componentTestMock.beforeMountCall).toEqual(true);
  });
  
  group.it("Component.onCreate called", () => {
    expect(componentTestMock.onCreateCall).toEqual(true);
  });
  
  group.it("Component rendered ", async () => {
    await element.connectedCallback();
    expect(componentTestMock.rendered).toEqual(true);
    expect(componentTestMock.onRenderCall).toEqual(true);
  });
  
  group.it("Component.onRender called", () => {
    expect(componentTestMock.onRenderCall).toEqual(true);
  });
  
  group.it("Component.onDestroy called", async() => {
    await element.disconnectedCallback();
    expect(componentTestMock.onDestroyCall).toEqual(true);
  });
  
});