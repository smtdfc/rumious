import { createOrGetData } from '../utils/data.js'
import { createElement } from '../utils/element.js'

export class RumiousUIProgressBar {
  constructor(element) {
    this.element = element
    this.data = createOrGetData(this.element, {
      current:
        parseFloat(
          getComputedStyle(this.element)
            .getPropertyValue('--progress-bar-value')
            .replace('%', ''),
        ) || 0,
    })
  }

  static name = 'progressbar'
  static generator(element) {
    return new RumiousUIProgressBar(element)
  }

  updateText() {
    if (this.element.classList.contains('.progree-bar-text')) {
      ;(
        this.element.querySelector('.progress-bar') ??
        createElement('div', 'progress-bar')
      ).textContent = `${this.data.current} %`
    } else {
      ;(
        this.element.querySelector('.progress-bar') ??
        createElement('div', 'progress-bar')
      ).textContent = 0
    }
  }

  increase(value) {
    this.data.current += value
    this.element.style.setProperty(
      '--progress-bar-value',
      `${this.data.current}%`,
    )
  }

  decrease(value) {
    this.data.current -= value
    this.element.style.setProperty(
      '--progress-bar-value',
      `${this.data.current}%`,
    )
  }

  set(value) {
    this.data.current = value
    this.element.style.setProperty(
      '--progress-bar-value',
      `${this.data.current}%`,
    )
  }

  action(info) {
    switch (info.type) {
      case 'increase':
        this.increase(parseInt(info.options[0]) || 1)
        break

      case 'set':
        this.set(parseInt(info.options[0]) || 0)
        break

      case 'decrease':
        this.decrease(parseInt(info.options[0]) || 1)
        break

      default:
        throw 'Unsupported action !'
    }
  }
}
