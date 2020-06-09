let menuBtn = document.querySelector('[data-menu-btn]'),
    header = document.querySelector('[data-header]');

if (menuBtn) menuBtn.addEventListener('click', menuStateHandler);

function menuStateHandler() {
  let attr = this.getAttribute('data-menu-btn');
  stateMenu(attr);
  this.setAttribute('data-menu-btn', attr === 'close' ? 'open' : 'close');
}

function stateMenu(f) {
  header.classList[f === 'close' ? 'add' : 'remove']('header--menu-open');
  // функция блока скролла
}
