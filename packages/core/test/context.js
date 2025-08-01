import { describe, expect } from 'testious';
import {
  Context,
  State
} from '../dist/index.js';


describe('Rumious Context test', (group) => {
  let ctxTestMock = {
    listenerTriggered: false
  };
  
  let testValue = {
    test: "ok"
  }
  const testCtx = new Context(testValue);
  testCtx.on("test", () => {
    ctxTestMock.listenerTriggered = true;
  });
  
  group.it('Context init conrrectly', () => {
    expect(testCtx.get()).toEqual(testValue);
  });
  
  group.it('Context.set works', () => {
    let newVal = {
      test: "test"
    }
    expect(testCtx.get()).toEqual(testValue);
    testCtx.set(newVal);
    expect(testCtx.get()).toEqual(newVal);
  });
  
  group.it("Context event triggered ", () => {
    testCtx.emit("test");
    expect(ctxTestMock.listenerTriggered).toEqual(true);
  });
  
  group.it('Context.setKey works', () => {
    let newVal = {
      test: "test"
    }
    
    testCtx.setKey("test", newVal);
    expect(testCtx.getKey("test")).toEqual(newVal);
  });
  
  group.it('Context.getKey works', () => {
    let newVal = {
      test: true
    }
    
    testCtx.setKey("test", newVal);
    expect(testCtx.getKey("test")).toEqual(newVal);
  });
  
  group.it('Context.reactiveKey works', () => {
    expect(testCtx.reactiveKey("test")).toBeInstanceOf(State);
  });
  
});