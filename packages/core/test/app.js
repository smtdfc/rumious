import { describe, expect } from 'testious';
import {
  App,
  Module,
  createApp,
} from '../dist/index.js';

describe('Rumious App test', (group) => {
  let appTestMock = {
    layoutRendered: false,
    renderCtxPassed: false
  };
  
  let moduleTestMock = {
    moduleInitTrueWay: false,
    moduleStarted: false,
    moduleOptPassed: false,
    moduleAppPassed: false,
    moduleBeforeRenderHookCalled: false,
  };
  
  const testModOpt = { test: "ok" };
  
  class TestModule extends Module {
    constructor(app_, opts) {
      super("test-module", app);
      moduleTestMock.moduleAppPassed = app === app_;
      moduleTestMock.moduleOptPassed = opts === testModOpt;
      moduleTestMock.moduleInitTrueWay = true;
    }
    
    onBeforeRender() {
      moduleTestMock.moduleBeforeRenderHookCalled = true;
    }
    
    start() {
      moduleTestMock.moduleStarted = true;
    }
  }
  
  const app = createApp({
    root: document.body
  });
  
  group.it('createApp working ', () => {
    expect(app).toBeInstanceOf(App);
  });
  
  group.it('App.setRootLayout working ', () => {
    const layout = (ctx) => {
      appTestMock.layoutRendered = true;
      appTestMock.renderCtxPassed = ctx === app.renderContext;
      let frag = document.createDocumentFragment();
      return frag;
    };
    
    app.setRootLayout(layout);
    expect(app.rootLayout).toEqual(layout);
  });
  
  group.it('App.addModule working ', () => {
    app.addModule(TestModule, testModOpt);
    expect(moduleTestMock.moduleAppPassed).toEqual(true);
    expect(moduleTestMock.moduleOptPassed).toEqual(true);
    expect(moduleTestMock.moduleInitTrueWay).toEqual(true);
    expect(app.modules["test-module"]).toBeTruthy();
  });
  
  group.it('App.start working ', () => {
    app.start();
    expect(appTestMock.layoutRendered).toEqual(true);
    expect(appTestMock.renderCtxPassed).toEqual(true);
    expect(moduleTestMock.moduleBeforeRenderHookCalled).toEqual(true);
    expect(moduleTestMock.moduleStarted).toEqual(true);
  });
  
});