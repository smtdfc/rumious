export class RumiousDirective {
init(){}
}


const directives = {
  on(event,value) {
    return new RumiousDirective(event,value)
  },
  "bind": null
};


export function registerDirective(type, name, value) {
  return directives[type]?.(name, value);
}