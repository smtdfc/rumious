export class RumiousUIToast {
  constructor(element) {
    this.element = element
  }

  static name = 'toast'
  static generator(element) {
    return new RumiousUIToast(element)
  }

  static create(message, type) {
    let element = document.createElement('div')
    element.textContent = message
    element.classList.add('toast', `toast-${type}`)
    return this.generator(element)
  }

  show() {
    this.element.classList.add('show')
    this.element.classList.remove('hide')
  }

  hide(remove = false) {
    this.element.classList.remove('show')
    this.element.classList.add('hide')
    if (remove) {
      setTimeout(() => {
        this.element.remove()
      }, 500)
    }
  }

  toggle() {
    if (this.element.classList.contains('show')) {
      this.hide()
    } else {
      this.show()
    }
  }

  action(info) {
    switch (info.type) {
      case 'toggle':
        this.toggle()
        break

      case 'show':
        this.open()
        break

      case 'hide':
        this.close(...info.options)
        break

      default:
        throw 'Unsupported action !'
    }
  }
}
