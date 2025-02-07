export function watch(state, callback){
  state.reactor.addBinding(callback);
}

export function unwatch(state,callback){
  state.reactor.removeBinding(callback);
}