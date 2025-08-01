import { describe, expect } from 'testious';
import { ViewControl } from '../dist/index.js';

describe('ViewControl test', (group) => {
  let vc;
  let container;
  
  group.beforeEach(() => {
    vc = new ViewControl();
    container = document.createElement('div');
    vc.setTarget(container);
  });
  
  group.it('addChild works', () => {
    const child = document.createElement('span');
    child.textContent = 'child';
    vc.addChild(child);
    expect(container.contains(child)).toEqual(true);
    expect(container.children.length).toEqual(1);
  });
  
  group.it('prependChild works', () => {
    const child1 = document.createElement('div');
    child1.textContent = 'last';
    const child2 = document.createElement('div');
    child2.textContent = 'first';
    vc.addChild(child1);
    vc.prependChild(child2);
    expect(container.firstChild).toEqual(child2);
  });
  
  group.it('removeChildByIndex works', () => {
    const child1 = document.createElement('div');
    const child2 = document.createElement('div');
    child1.textContent = 'one';
    child2.textContent = 'two';
    vc.addChild(child1);
    vc.addChild(child2);
    vc.removeChildByIndex(0);
    expect(container.children.length).toEqual(1);
    expect(container.children[0].textContent).toEqual('two');
  });
  
  group.it('removeChildByIndex with invalid index does nothing', () => {
    const child = document.createElement('div');
    vc.addChild(child);
    vc.removeChildByIndex(10); // index out of bounds
    expect(container.children.length).toEqual(1);
  });
  
  group.it('clean works', () => {
    const child = document.createElement('p');
    child.textContent = 'hello';
    vc.addChild(child);
    vc.clean();
    expect(container.textContent).toEqual('');
  });
  
  group.it('works without setTarget (no crash)', () => {
    const temp = new ViewControl();
    expect(() => {
      temp.addChild(document.createElement('div'));
      temp.prependChild(document.createElement('div'));
      temp.removeChildByIndex(0);
      temp.clean();
    }).not.toThrow();
  });
});