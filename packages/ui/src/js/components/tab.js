export class RumiousUITab {
  constructor(element) {
    this.element = element;
  }
  
  static name = 'tab'
  static generator(element) {
    return new RumiousUITab(element);
  }
  
  inactiveAll() {
    Array.from(this.element.children).forEach(element => {
      element.classList.remove('active');
      if (element.dataset.panel) {
        document.querySelector(element.dataset.panel).classList.remove();
      }
    });
  }
  
  active(element) {
    function transition() {
      this.inactiveAll();
      element.classList.add('active')
    }
    
    if (element.classList.contains('active')) return;
    if (!document.startViewTransition) {
      transition();
      return;
    }
    
    document.startViewTransition(() => transition.apply(this));
    if (element.dataset.panel) {
      document.querySelector(element.dataset.panel).classList.add('active');
    }
  }
  
  action(info) {
    switch (info.type) {
      
      case 'active':
        this.active(info.trigger)
        break;
        
      default:
        throw 'Unsupported action !'
    }
  }
  
}