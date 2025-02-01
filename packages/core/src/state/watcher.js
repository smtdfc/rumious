export function watcher(state, callback){
  state.reactor.addBinding(callback);
}