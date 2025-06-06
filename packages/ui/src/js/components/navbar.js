export class RumiousUINavbar {
  constructor(element) {
    this.element = element
  }

  static name = 'navbar'
  static generator(element) {
    return new RumiousUINavbar(element)
  }

  open() {
    this.element.classList.add('open')
  }

  close() {
    this.element.classList.remove('open')
  }

  toggle() {
    if (this.element.classList.contains('open')) {
      this.close()
    } else {
      this.open()
    }
  }

  action(info) {
    switch (info.type) {
      case 'toggle':
        this.toggle()
        break

      case 'open':
        this.open()
        break

      case 'close':
        this.close()
        break

      default:
        throw 'Unsupported action !'
    }
  }
}
