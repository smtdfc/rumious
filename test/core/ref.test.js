const { describe, expect } = require('testious');
const {RumiousRef, createRef } = require('../../packages/core/dist/index.js');


describe("RumiousRef testing ",(group)=>{
  
  const element= document.createElement("span");
  const ref = createRef();
  
  group.it("createRef() working ",()=>{
    expect(ref).toBeInstanceOf(RumiousRef);
  });
  
  group.it("Element binding ",()=>{
    ref.setTarget(element);
    expect(ref.element).toBeInstanceOf(HTMLElement);
  });
  
});