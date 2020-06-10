import ScrollControl from './scrollControl.js';

let menuBtn = document.querySelector('[data-menu-btn]'),
    header = document.querySelector('[data-header]'),
    links = [...document.querySelectorAll('[data-link="scroll"]')];

if (window.matchMedia("(max-width: 767px)").matches && menuBtn) {
  menuBtn.addEventListener('click', menuStateHandler);
}

function menuStateHandler() {
  let attr = this.getAttribute('data-menu-btn');

  links.forEach(el => el.addEventListener('click', stateMenu));

  stateMenu(attr);
}

function stateMenu(f = 'open') {
  header.classList[f === 'close' ? 'add' : 'remove']('header--menu-open');
  menuBtn.setAttribute('data-menu-btn', f === 'close' ? 'open' : 'close');
  f === 'close' ? ScrollControl.lock() : ScrollControl.unlock();
  // функция блока скролла
}
