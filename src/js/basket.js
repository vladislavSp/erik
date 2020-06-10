import ScrollControl from './scrollControl.js';

let basketBtns = [...document.querySelectorAll('*[data-basket-btn]')],
    basket = document.querySelector('[data-basket]');

if (basketBtns) basketBtns.forEach(el => el.addEventListener('click', changeStateBasketHandler));

function changeStateBasketHandler(evt) {
  evt.preventDefault();
  let state = this.getAttribute('data-basket-btn');
  stateBasket(state);
}

function stateBasket(state) {
  basket.setAttribute('data-state', `${state === 'close' ? 'open' : 'close'}`);
  state === 'close' ? ScrollControl.lock() : ScrollControl.unlock();
}



// Переключение черной темы
let selectorTheme = document.querySelector('.selector__theme');
let container = document.querySelector('[data-container]');

if (selectorTheme) selectorTheme.addEventListener('click', stateTheme);

function stateTheme() {
  this.classList.toggle('selector__active');

  document.body.classList.toggle('container--black');
  container.classList.toggle('container--black');
}
