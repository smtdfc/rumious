import { describe, expect } from 'testious';
import {
  State,
  createState,
  wrapState,
  isState,
  watch,
  unwatch,
} from '../dist/index.js';

describe('Rumious State test', (group) => {
  group.it('State basic get/set', () => {
    const s = createState(5);
    expect(s.get()).toEqual(5);
    
    s.set(10);
    expect(s.get()).toEqual(10);
  });
  
  group.it('State shallow equal prevent update', () => {
    const obj = { a: 1 };
    const s = createState(obj);
    let updated = false;
    
    watch(s, () => (updated = true));
    s.set({ a: 1 }); // shallowEqual -> skip
    expect(updated).toEqual(false);
  });
  
  group.it('State update works', () => {
    const s = createState(1);
    s.update((v) => v + 1);
    expect(s.get()).toEqual(2);
  });
  
  
  group.it('State.setInSlient does not trigger', () => {
    const s = createState(10);
    let count = 0;
    
    watch(s, () => count++);
    s.setInSlient(20);
    expect(s.get()).toEqual(20);
    expect(count).toEqual(0);
  });
  
  group.it('State.wrapKey returns reactive sub-state', () => {
    const s = createState({ msg: 'hello' });
    const sub = s.wrapKey('msg');
    expect(sub.get()).toEqual('hello');
    
    s.setKey('msg', 'world');
    expect(sub.get()).toEqual('world');
  });
  
  group.it('State.setByIndex works on array', () => {
    const s = createState(['a', 'b', 'c']);
    s.setByIndex(1, 'z');
    expect(s.get()).toEqual(['a', 'z', 'c']);
  });
  
  group.it('State.insertAt / removeAt / append / prepend', () => {
    const s = createState(['a', 'b']);
    s.insertAt(1, 'x');
    expect(s.get()).toEqual(['a', 'x', 'b']);
    
    s.removeAt(0);
    expect(s.get()).toEqual(['x', 'b']);
    
    s.append('c');
    expect(s.get()).toEqual(['x', 'b', 'c']);
    
    s.prepend('start');
    expect(s.get()).toEqual(['start', 'x', 'b', 'c']);
  });
  
  group.it('State.map behaves like Array.prototype.map', () => {
    const s = createState([1, 2, 3]);
    const result = s.map((x) => x * 2);
    expect(result).toEqual([2, 4, 6]);
  });
  
  group.it('State.getKey returns correct value', () => {
    const s = createState({ name: 'Alice' });
    expect(s.getKey('name')).toEqual('Alice');
  });
  
  group.it('isState identifies state instances', () => {
    const s = createState(123);
    const not = { lol: true };
    expect(isState(s)).toEqual(true);
    expect(isState(not)).toEqual(false);
  });
  
  group.it('State.setByIndex throws if not array', () => {
    const s = createState({});
    
    expect(() => s.setByIndex(0, 1)).toThrow();
  });
  
  group.it('State.insertAt throws on invalid index', () => {
    const s = createState([]);
    
    expect(() => s.insertAt(-1, 'x')).toThrow();
    expect(() => s.insertAt(2, 'x')).toThrow();
  });
  
  group.it('State.removeAt throws on invalid index', () => {
    const s = createState(['a']);
    
    expect(() => s.removeAt(-1)).toThrow();
    expect(() => s.removeAt(99)).toThrow();
  });
});