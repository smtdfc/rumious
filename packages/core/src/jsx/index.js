import { isComponent } from '../component/render.js';


function createElement(type, props, ...children) {
  
  if(isComponent(type)){
    return createComponent(type,props);
  }
  
  if (type === createFragment) {
    return createFragment(...children);
  }

  return {
    type,
    props: {
      ...props,
      children: children.map(child =>
        typeof child === "object" ?
        child :
        createTextElement(child)
      ),
    },
  }
}

function createTextElement(text) {
  return {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: text,
      children: [],
    },
  }
}

function createComponent(type,props){
  return {
    type:"COMPONENT",
    props:props,
    component:type
  }
}

function createFragment(...children) {
  return {
    type: "FRAGMENT",
    props: {
      children: children.map(child =>
        typeof child === "object" ?
        child :
        createTextElement(child)
      ),
    },
  };
}

window.AURA_JSX_SUPPORT = {
  createElement,
  createFragment,
};