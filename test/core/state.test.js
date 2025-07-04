const { describe, expect } = require('testious');
const {
  RumiousState,
  RumiousListState,
  createListState,
  createStore,
  createState,
  watch,
  unwatch
} = require('../../packages/core/dist/index.js');



describe("RumiousState testing", (group) => {
  let count = 0;
  let state;
  let cb;
  
  group.beforeEach(() => {
    count = 0;
    state = createState("test");
    cb = () => { count += 1 };
    watch(state, cb);
  });
  
  group.afterEach(() => {
    unwatch(state, cb);
  });
  
  group.it("createState() returns instance of RumiousState", () => {
    expect(state).toBeInstanceOf(RumiousState);
  });
  
  group.it("State has initial value correctly", () => {
    expect(state.value).toEqual("test");
  });
  
  group.it("state.set() updates value", () => {
    state.set("hello");
    expect(state.value).toEqual("hello");
  });
  
  group.it("watch() triggers when state changes", () => {
    state.set("world");
    expect(count).toEqual(1);
  });
  
  group.it("slientUpdate() updates value without triggering watcher", () => {
    state.slientUpdate("silent");
    expect(state.value).toEqual("silent");
    expect(count).toEqual(0);
  });
  
  group.it("trigger() manually calls watchers", () => {
    state.trigger();
    expect(count).toEqual(1);
  });
  
  group.it("unwatch() stops watcher from being called", () => {
    unwatch(state, cb);
    state.set("again");
    expect(count).toEqual(0);
  });
  
  group.it("Multiple watchers work independently", () => {
    let anotherCount = 0;
    const anotherCb = () => { anotherCount++ };
    watch(state, anotherCb);
    
    state.set("newValue");
    expect(count).toEqual(1);
    expect(anotherCount).toEqual(1);
    
    unwatch(state, anotherCb);
    state.set("nextValue");
    expect(count).toEqual(2);
    expect(anotherCount).toEqual(1);
  });
});


describe("RumiousListState testing", (group) => {
  let list;
  let notified;
  
  const mockReactor = {
    notify: (info) => {
      notified.push(info);
    },
  };
  
  group.beforeEach(() => {
    notified = [];
    list = new RumiousListState([], mockReactor);
  });
  
  group.it("appends item and notifies", () => {
    list.append("A");
    
    expect(list.value).toEqual(["A"]);
    const info = notified[0];
    expect(info.type).toEqual("append");
    expect(info.key).toEqual(0);
    expect(info.value).toEqual("A");
    expect(info.state).toBe(list);
  });
  
  group.it("prepends item and notifies", () => {
    list.append("B");
    list.prepend("A");
    
    expect(list.value).toEqual(["A", "B"]);
    const info = notified[1];
    expect(info.type).toEqual("prepend");
    expect(info.key).toEqual(0);
    expect(info.value).toEqual("A");
    expect(info.state).toBe(list);
  });
  
  group.it("inserts item at given position", () => {
    list.append("A");
    list.append("C");
    list.insert(1, "B");
    
    expect(list.value).toEqual(["A", "B", "C"]);
    const info = notified[2];
    expect(info.type).toEqual("insert");
    expect(info.key).toEqual(1);
    expect(info.value).toEqual("B");
    expect(info.state).toBe(list);
  });
  
  group.it("updates item at position", () => {
    list.append("A");
    list.updateAt(0, "B");
    
    expect(list.value).toEqual(["B"]);
    const info = notified[1];
    expect(info.type).toEqual("update");
    expect(info.key).toEqual(0);
    expect(info.value).toEqual("B");
    expect(info.state).toBe(list);
  });
  
  group.it("removes item at position", () => {
    list.append("A");
    list.append("B");
    list.remove(0);
    
    expect(list.value).toEqual(["B"]);
    const info = notified[2];
    expect(info.type).toEqual("remove");
    expect(info.key).toEqual(0);
    expect(info.value).toEqual("A");
    expect(info.state).toBe(list);
  });
  
  group.it("clears the list", () => {
    list.append("A");
    list.append("B");
    list.clear();
    
    expect(list.value).toEqual([]);
    const info = notified[2];
    expect(info.type).toEqual("set");
    expect(info.value).toEqual([]);
    expect(info.state).toBe(list);
  });
  
  group.it("reverses the list", () => {
    list.append("A");
    list.append("B");
    list.reverse();
    
    expect(list.value).toEqual(["B", "A"]);
    const info = notified[2];
    expect(info.type).toEqual("set");
    expect(info.value).toEqual(["B", "A"]);
    expect(info.state).toBe(list);
  });
  
  group.it("filters the list", () => {
    list.append(1);
    list.append(2);
    list.append(3);
    list.filter((x) => x % 2 === 1);
    
    expect(list.value).toEqual([1, 3]);
    const info = notified[3];
    expect(info.type).toEqual("set");
    expect(info.value).toEqual([1, 3]);
    expect(info.state).toBe(list);
  });
});

describe("RumiousStore testing", (group) => {
  let store;
  
  group.beforeEach(() => {
    store = createStore({
      name: "Rumious",
      version: 1
    });
  });
  
  group.it("creates store with initial states", () => {
    expect(store.get("name")).toBeInstanceOf(RumiousState);
    expect(store.get("version")).toBeInstanceOf(RumiousState);
    
    expect(store.get("name").value).toEqual("Rumious");
    expect(store.get("version").value).toEqual(1);
  });
  
  group.it("updates store via set()", () => {
    store.set({
      name: "Testious",
      version: 2
    });
    
    expect(store.get("name").value).toEqual("Testious");
    expect(store.get("version").value).toEqual(2);
  });
  
  group.it("adds new state if key not existed", () => {
    store.set({
      name: "Testious",
      version: 2,
      author: "smtdfc"
    });
    
    expect(store.get("author")).toBeInstanceOf(RumiousState);
    expect(store.get("author").value).toEqual("smtdfc");
  });
  
  group.it("maps all states", () => {
    const keys = store.map((state, key) => `${key}:${state.value}`);
    expect(keys).toContain("name:Rumious");
    expect(keys).toContain("version:1");
  });
  
  group.it("removes state and value by key", () => {
    store.remove("name");
    expect(store.states["name"]).toBeUndefined();
    expect(store.value["name"]).toBeUndefined();
  });
});
