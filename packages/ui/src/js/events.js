window.addEventListener('click', function(e) {
  let target = e.target;
  
  if (target.classList.contains('sub-menu')) {
    target.classList.toggle('open');
    return;
  }
  
  
  
  if (target.tagName.toLowerCase() === 'a') {
    let parentSubMenu = target.closest('.sub-menu');
    
    if (parentSubMenu) {
      parentSubMenu.classList.toggle('open');
    }
  }
});