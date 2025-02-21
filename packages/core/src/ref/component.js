/**
 * A class that provides a reference to a Rumious component
 * and access to the component's forwardRefs.
 *  
 */
export class RumiousComponentRef {
  /**
   * Creates an instance of RumiousComponentRef with the given component.
   * 
   * @constructor
   * @param {Object} component - The Rumious component whose reference will be managed.
   */
  constructor(component) {
    this.target = component;
  }
  
  /**
   * Updates the target of the reference to the component's forwardRefs.
   * 
   * @param {Object} component - The component whose forwardRefs will be set as the target.
   */
  set(component) {
    this.target = component.forwardRefs;
  }
}

/**
 * Creates and returns a new RumiousComponentRef instance for the specified Rumious component.
 * 
 * @param {Object} component - The Rumious component for which a reference will be created.
 * @returns {RumiousComponentRef} A new instance of RumiousComponentRef for the component.
 */
export function createComponentRef(component) {
  return new RumiousComponentRef(component);
}