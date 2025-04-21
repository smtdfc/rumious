import { generateId } from './utils/key.js'
import { RumiousUIToast } from './components/index.js'

export class ToastGenerator {
  static containerID = `rumiousui_${generateId()}`
  static ensureContainer() {
    let element = document.getElementById(ToastGenerator.containerID)
    if (!element) {
      element = document.createElement('div')
      element.className = 'toast-container'
      element.setAttribute('id', ToastGenerator.containerID)
      document.body.appendChild(element)
    }
    return element
  }

  static show(message, options = {}) {
    let container = this.ensureContainer()
    let toast = RumiousUIToast.create(message, options.type ?? 'primary')
    container.appendChild(toast.element)
    toast.show()
    setTimeout(() => {
      toast.hide(options.remove)
    }, options.duration ?? 5000)
  }
}
