/**
  Replaces a child at the given index with a new element.
  If the index is out of range, appends the new element instead.
  @param {HTMLElement} container - The parent container.
  @param {number} index - The index of the child to replace.
  @param {HTMLElement} newElement - The new element to insert. 
*/
function replaceChildByIndex(container, index, newElement) {
	let children = container.children;
	if (index >= 0 && index < children.length) {
		container.replaceChild(newElement, children[index]);
		
	} else {
		container.appendChild(newElement);
	}
}

/**
  Creates a new instance of RumiousArraySync for synchronizing state with UI.
  @param {Object} state - The reactive state array.
  @param {Function} template - A function that returns a template based on state data.
  @returns {RumiousArraySync} - The RumiousArraySync instance.
*/
export function syncArray(state, template) {
	return new RumiousArraySync(state, template);
}


/**
  Class for synchronizing an array state with the UI efficiently. 
*/
export class RumiousArraySync {
	
	/**
	  @param {Object} state - The reactive state array.
	  @param {Function} template - A function returning the UI representation of state data. 
	*/
	constructor(state, template) {
		this.state = state;
		this.template = template;
		this.target = null;
	}
	
	/**
	  Sets the target DOM element where the list will be rendered.
	  @param {HTMLElement} target - The target container.
	  @param {Function} renderer - The function that converts template to DOM elements.
	  @param {Object} context - The context for rendering. 
	*/
	setTarget(target, renderer, context) { this.target = { element: target, context, renderer }; }
	
	/*
		Clean function when target remove 
	*/
	clean() {
		if (!this.target) return;
		this.state.reactor.removeBinding(this.onChange.bind(this));
	}
	
	/**
	  Synchronizes the UI with the state.
	  Attaches a listener to react to state changes. 
	*/
	sync() {
		if (!this.target) return;
		this.renderAll();
		this.state.reactor.addBinding(this.onChange.bind(this));
	}
	
	/**
	  Renders all items from the state array to the UI.
	*/
	renderAll() {
		this.target.element.textContent = '';
		this.state.value.forEach((value, index) => this.appendElement(value, index));
	}
	
	/**
	 Appends a new element to the UI.
	  @param {any} value - The data to be used for rendering.
	  @param {number} index - The index of the item.
	*/
	appendElement(value, index) {
		let template = this.template(value, index);
		let fragment = this.target.renderer(template, document.createDocumentFragment(), this.target.context);
		this.target.element.appendChild(fragment);
	}
	
	
	/**
	  Handles changes in the state and updates the UI accordingly.
	  @param {Object} commit - The commit object describing the change.
	  @property {string} commit.type - The type of state change.
	  @property {number} commit.index - The index of the changed element.
	  @property {any} commit.value - The new value (if applicable). 
	*/
	onChange(commit) {
		if (!this.target) return;
		switch (commit.type) {
			case 'REMOVE_ELEMENT': {
				let elementToRemove = this.target.element.children[commit.index];
				if (elementToRemove) {
					this.target.element.removeChild(elementToRemove);
				}
				break;
			}
			
			case 'SET_VALUE': {
				this.renderAll();
				break;
			}
			
			case 'ADD_ELEMENT': {
				this.appendElement(commit.value, commit.index);
				break;
			}
			
			case 'SET_ELEMENT': {
				let template = this.template(commit.value, commit.index);
				let fragment = this.target.renderer(template, document.createDocumentFragment(), this.target.context);
				replaceChildByIndex(this.target.element, commit.index, fragment);
				break;
			}
			
			case 'INSERT_ELEMENT': {
				let template = this.template(commit.value, commit.index);
				let fragment = this.target.renderer(template, document.createDocumentFragment(), this.target.context);
				let children = this.target.element.children;
				
				if (commit.index >= children.length) {
					this.target.element.appendChild(fragment);
				} else {
					this.target.element.insertBefore(fragment.children[0], children[commit.index]);
				}
				break;
			}
		}
		
	}
}

/**
  Note:
    When using Fragment, be aware that fragments do not persist in the DOM.
    Ensure that fragment.children[0] is correctly handled to avoid inconsistencies.
*/