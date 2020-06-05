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
}
