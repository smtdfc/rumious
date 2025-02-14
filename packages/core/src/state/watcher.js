/**
 * Registers a callback function to react to changes in the given state.
 * @param {RumiousState} state - The reactive state to watch.
 * @param {Function} callback - The function to execute when the state changes.
 */
export function watch(state, callback) {
  state.reactor.addBinding(callback);
}

/**
 * Unregisters a previously registered callback from the state.
 * @param {RumiousState} state - The reactive state to unwatch.
 * @param {Function} callback - The function to remove from the state bindings.
 */
export function unwatch(state, callback) {
  state.reactor.removeBinding(callback);
}