import { RumiousUITab } from './components/index.js'
import { createElement } from './utils/element.js'

window.addEventListener('click', function (e) {
  let target = e.target

  if (target.classList.contains('sub-menu')) {
    target.classList.toggle('open')
    return
  }

  if (target.tagName.toLowerCase() === 'a') {
    let parentSubMenu = target.closest('.sub-menu')

    if (parentSubMenu) {
      parentSubMenu.classList.toggle('open')
    }
  }
})

window.addEventListener('load', () => {
  document.querySelectorAll('.tabs-container').forEach((element) => {
    let tab = new RumiousUITab(element)
    tab.active(tab.getActiveItem() || createElement('div'))
  })
})
