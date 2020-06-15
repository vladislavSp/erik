import ScrollControl from './scrollControl.js';

let basketBtns = [...document.querySelectorAll('*[data-basket-btn]')],
    basket = document.querySelector('[data-basket]'),
    basketViewOrderBtn = document.querySelector('[data-order-basket="btn"]'),
    basketOrder = document.querySelector('[data-basket="translate"]'),
    selectorTheme = document.querySelector('.selector__theme'),
    container = document.querySelector('[data-container]'),
    // sect fort Good Add
    addGoodBtn = document.querySelector('[data-good-btn="add"]'),
    basketCounters = [...document.querySelectorAll('*[data-basket-counter]')],
    basketFullView = document.querySelector('[data-basket-full]'),
    basketEmptyView = document.querySelector('[data-basket-empty]'),
    basketContainer = document.querySelector('.basket__list'),
    goodsArray = [];

if (!localStorage.goods) localStorage.goods = JSON.stringify([]);
if (basketBtns) basketBtns.forEach(el => el.addEventListener('click', changeStateBasketHandler));
if (basketViewOrderBtn) basketViewOrderBtn.addEventListener('click', viewOrderBasket);
if (selectorTheme) selectorTheme.addEventListener('click', stateTheme);// black theme
if (addGoodBtn) addGoodBtn.addEventListener('click', addGoodHandler);
// ADD GOOD and ViewBasket

stateViewBasket();
countGoods();

function stateViewBasket() {
  if (JSON.parse(localStorage.goods).length) {
    showBasket(true);
    renderGoodsList(localStorage.goods);
  } else {
    showBasket(false);
  }
}

function changeStateBasketHandler(evt) {
  evt.preventDefault();
  let state = this.getAttribute('data-basket-btn');
  stateBasket(state);
}
function stateBasket(state) {
  basket.setAttribute('data-state', `${state === 'close' ? 'open' : 'close'}`);
  state === 'close' ? ScrollControl.lock() : ScrollControl.unlock();
}
function viewOrderBasket(evt) {
  evt.preventDefault();
  basketOrder.classList.toggle('basket-translate');
  this.textContent = basketOrder.classList.contains('basket-translate') ? `Показать корзину` : `Скрыть корзину`;
}
function stateTheme() {
  this.classList.toggle('selector__active');
  document.body.classList.toggle('container--black');
  container.classList.toggle('container--black');
}
function showBasket(state) {
  basketFullView.style.display = state ? '' : 'none';
  basketEmptyView.style.display = state ? '' : 'block';
}

// Счётчик товаров в корзине
function countGoods() {
  basketCounters.forEach(el => el.textContent = JSON.parse(localStorage.goods).length);
}

function addGoodHandler(evt) { // обр-к кнопки добавления товара
  evt.preventDefault();
  addToStorage(createObjectForStorage(this));
  // renderGoodsList(localStorage.goods);
  // stateViewBasket();
  // countGoods();
}

// Формирование объекта для Storage и рендер его в корзине
function createObjectForStorage(btn) {
  let obj = {};
  obj.id = btn.getAttribute('data-good-id');
  obj.title = btn.getAttribute('data-good-title');
  obj.cost = btn.getAttribute('data-good-cost');
  obj.desc = btn.getAttribute('data-good-desc');
  obj.img = btn.getAttribute('data-good-img');

  return obj;
}

function addToStorage(obj) { // obj - ранее сформированный объект
  goodsArray = JSON.parse(localStorage.goods);

  if (goodsArray.every(el => el.name !== obj.name)) { // Если есть id в массиве 
    goodsArray.push(obj); // если добавляется, то происходит и новый рендер
    localStorage.setItem(`goods`, JSON.stringify(goodsArray));
    renderGoodsList(localStorage.goods);
    stateViewBasket();
    countGoods();
  }
}

function renderGoodsList(renderItem) {
  let goods = JSON.parse(renderItem); // рэндер товаров в корзину из LocalStorage

  basketContainer.innerHTML = '';
  if (goods) goods.forEach((el, index) => basketContainer.appendChild(renderOneGood(el, index)));
  //createTotalCost(); // подсчёт цены
  //changeQuantityGoods(); // добавление обработчиков кнопок для плюса и минуса
}

function renderOneGood(element, i) {
  // рендер одного элемента корзины
  let goodTemplate = document.getElementById('goods-template').content;
  // клон шаблона и внутр-го контента
  let workTemplate = goodTemplate.cloneNode(true).querySelector('.basket__item');
  let deleteBtnBasket = workTemplate.querySelector('[data-basket-delete]');

  workTemplate.setAttribute('id-data', i);
  deleteBtnBasket.setAttribute('data-basket-delete', i);
  // deleteBtnBasket.addEventListener('click', deleteGood);
  workTemplate.querySelector('[data-goods-title]').textContent = element.title;
  workTemplate.querySelector('[data-goods-desc]').textContent = element.desc;
  workTemplate.querySelector('[data-goods-cost]').textContent = element.cost;
  // workTemplate.querySelector('[data-goods-number]').textContent = element.number;
  workTemplate.querySelector('[data-goods-img]').src = element.img; // изображение в корзине
  // if (element.number) workTemplate.querySelector('[bags="goods_price"]').textContent = element.price * element.number;

  return workTemplate;
}
