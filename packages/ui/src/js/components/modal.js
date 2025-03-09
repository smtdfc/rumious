export class RumiousUIModal {
  constructor(element) {
    this.element = element;
    this.contents = this.element.querySelector(".modal-content");
    
    this.element.style.display = "none";
  }
  
  static name="modal"
  static generator(element) {
    return new RumiousUIModal(element);
  }
  
  open() {
    if (this.element.classList.contains("active")) return;
    
    this.overlay = document.createElement("div");
    this.overlay.classList.add("modal-overlay");
    this.element.prepend(this.overlay);
    
    this.overlay.addEventListener("click", (e) => {
      if (e.target === this.overlay) this.close();
    });
    
    this.element.style.display = "block";
    requestAnimationFrame(() => {
      this.element.classList.add("active");
      this.element.classList.remove("modal-hidden");
    });
  }
  
  close() {
    this.element.classList.add("modal-hidden");
    this.element.classList.remove("active");
    const onAnimationEnd = () => {
      this.element.style.display = "none";
      this.element.classList.remove("modal-hidden");
      
      if (this.overlay) {
        this.overlay.remove();
        this.overlay = null;
      }
      
      this.element.removeEventListener("animationend", onAnimationEnd);
    };
    
    this.element.addEventListener("animationend", onAnimationEnd);
  }
  
  toggle() {
    if (this.element.classList.contains("active")) {
      this.close();
    } else {
      this.open();
    }
  }
  
}