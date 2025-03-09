import * as components from './components/index.js';
import * as actions from './actions.js';

function findComponent(type) {
  
  for (let componentClassName in components) {
    if (components[componentClassName].name === type) return components[componentClassName];
  }
}


function parseCommand(command) {
  const regex = /^(\w+):(\w+):([^()]+)((:[^)]+))*$/;
  const match = command.match(regex);
  
  if (!match) return null;
  
  const [, action, componentType, target, ...optionGroups] = match;
  
  const options = optionGroups
    .filter(opt => opt && opt.startsWith("("))
    .map(opt => opt.slice(1, -1).replace(/^:/, ""));
  
  return { action, componentType, target, options };
}

export class RumiousUIModule {
  constructor(app, opts = {}) {
    this.app = app;
    this.options = opts;
    this.initListener();
  }
  
  initListener() {
    
    window.addEventListener("click", (e) => {
      let target = e.target;
      let datasets = target.dataset;
      if (datasets.ui) {
        let { target, action, componentType } = parseCommand(datasets.ui);
        let element = document.querySelector(target);
        let Component = findComponent(componentType);
        console.log(Component)
        actions[action](
          Component,
          element
        )
      }
    })
    
  }
  
  static init(app, opts = {}) {
    return new RumiousUIModule(app, opts);
  }
  
}