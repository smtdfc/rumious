import * as components from './components/index.js';

function findComponent(type) {
  
  for (let componentClassName in components) {
    if (components[componentClassName].name === type) return components[componentClassName];
  }
}


function parseCommand(command) {
  const parts = command.split(':');
  
  if (parts.length < 3) return null;
  
  const [action, componentType, target, ...optionGroups] = parts;
  
  return { action, componentType, target, options: optionGroups };
}

export class RumiousUIModule {
  constructor(app, opts = {}) {
    this.app = app;
    this.options = opts;
    this.initListener();
  }
  
  initListener() {
    
    window.addEventListener('click', (e) => {
      let trigger = e.target;
      let datasets = trigger.dataset;
      if (datasets.ui) {
        let { target, action, componentType,options } = parseCommand(datasets.ui);
        let element = document.querySelector(target);
        let Component = findComponent(componentType);
        if (!Component) return;
        Component.generator(element, options).action({
          type: action,
          trigger: trigger,
          target:element,
          component:Component,
          options
        });
      }
    });
    
  }
  
  static init(app, opts = {}) {
    return new RumiousUIModule(app, opts);
  }
  
}