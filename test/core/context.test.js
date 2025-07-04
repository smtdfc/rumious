const { describe, expect } = require("testious");
const { createContext, RumiousContext } = require("../../packages/core/dist/index.js");

describe("RumiousContext testing ", (group) => {
  let ctx;
  
  group.beforeEach(() => {
    ctx = createContext({
      user: "smtdfc",
      role: "dev"
    });
  });
  
  group.it("returns value with get()", () => {
    expect(ctx.get("user")).toEqual("smtdfc");
    expect(ctx.get("role")).toEqual("dev");
  });
  
  group.it("sets value with set()", () => {
    ctx.set("user", "Arika");
    expect(ctx.get("user")).toEqual("Arika");
  });
  
  group.it("registers and emits event", () => {
    let called = false;
    ctx.on("ready", () => {
      called = true;
    });
    
    ctx.emit("ready");
    expect(called).toEqual(true);
  });
  
  group.it("emits with args", () => {
    let received = "";
    ctx.on("say", (msg) => {
      received = msg;
    });
    
    ctx.emit("say", "Hello world");
    expect(received).toEqual("Hello world");
  });
  
  group.it("calls multiple listeners", () => {
    let count = 0;
    const fn1 = () => { count += 1 };
    const fn2 = () => { count += 1 };
    
    ctx.on("multi", fn1);
    ctx.on("multi", fn2);
    
    ctx.emit("multi");
    expect(count).toEqual(2);
  });
  
  group.it("removes a specific listener", () => {
    let count = 0;
    const fn = () => { count += 1 };
    
    ctx.on("event", fn);
    ctx.off("event", fn);
    ctx.emit("event");
    
    expect(count).toEqual(0);
  });
  
  group.it("removes all listeners if fn not provided", () => {
    let count = 0;
    ctx.on("boom", () => { count += 1 });
    ctx.on("boom", () => { count += 1 });
    
    ctx.off("boom");
    ctx.emit("boom");
    
    expect(count).toEqual(0);
  });
  
  group.it("does nothing if event not registered", () => {
    expect(() => ctx.emit("nope")).not.toThrow();
    expect(() => ctx.off("nope")).not.toThrow();
  });
});