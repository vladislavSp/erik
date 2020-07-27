let menuBtn = document.querySelector('[data-menu-btn]'),
    header = document.querySelector('[data-header]'),
    links = [...document.querySelectorAll('[data-link="scroll"]')];

if (window.matchMedia("(max-width: 767px)").matches && menuBtn) {
  menuBtn.addEventListener('click', menuStateHandler);
}

function menuStateHandler(evt) {
  evt.preventDefault();

  let attr = this.getAttribute('data-menu-btn');

  links.forEach(el => el.addEventListener('click', stateMenu));

  stateMenu(attr);
}

function stateMenu(f = 'open') {
  header.classList[f === 'close' ? 'add' : 'remove']('header--menu-open');
  menuBtn.setAttribute('data-menu-btn', f === 'close' ? 'open' : 'close');
  document.body.overflowX = f === 'close' ? `hidden` : `` ;
}
