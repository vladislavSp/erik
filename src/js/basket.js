// import ScrollControl from './scrollControl.js';

let basketBtns = [...document.querySelectorAll(`*[data-basket-btn]`)],
    basket = document.querySelector(`[data-basket]`),
    basketViewOrderBtn = document.querySelector(`[data-order-basket="btn"]`),
    basketOrder = document.querySelector(`[data-basket="translate"]`),
    basketWrap = document.querySelector(`.basket-wrap`),
    // selectorTheme = document.querySelector(`.selector__theme`),
    // container = document.querySelector(`[data-container]`),

    // section for Good Add/Remove
    addGoodBtn = document.querySelector(`[data-good-btn="add"]`),
    basketCounters = [...document.querySelectorAll(`*[data-basket-counter]`)],
    basketFullView = document.querySelector(`[data-basket-full]`),
    basketEmptyView = document.querySelector(`[data-basket-empty]`),
    basketContainer = document.querySelector(`[data-basket-list]`),
    goodsArray = [];
    const ESC_CODE = 27;

if (!localStorage.goods) localStorage.goods = JSON.stringify([]);
if (basketBtns) basketBtns.forEach(el => el.addEventListener(`click`, changeViewBasketHandler));
if (basketViewOrderBtn) basketViewOrderBtn.addEventListener(`click`, viewOrderBasket);
// if (selectorTheme) selectorTheme.addEventListener(`click`, stateTheme);// black theme
if (addGoodBtn) addGoodBtn.addEventListener(`click`, addGoodHandler);

mainStateBasket(); // defined main initial state basket

function mainStateBasket() {
  if (JSON.parse(localStorage.goods).length) {
    contentViewBasket(true);
    renderGoodsList(localStorage.goods);
    createTotalCost();
  } else {
    contentViewBasket(false);
  }

  countGoods();
}

function changeViewBasketHandler(evt) {
  evt.preventDefault();
  let state = this.getAttribute(`data-basket-btn`);
  stateViewBasket(state);
}

function stateViewBasket(state) {
  // console.log(state);

  basket.setAttribute(`data-state`, `${state === `open` ? `open` : `close`}`);
  basketWrap.style.display = state === `open` ? `block` : `none`;
  basketWrap[state === `open` ? `addEventListener` : `removeEventListener`](`click`, clickCloseHandler);
  document[state===`open` ? `addEventListener` : `removeEventListener`](`keydown`, buttonCloseHandler);
}

function clickCloseHandler(evt) {
  if (this === evt.target || evt.target.hasAttribute(`data-basket-btn`)) {
    stateViewBasket(`close`);
    basketWrap.removeEventListener(`click`, clickCloseHandler);
  }
}

function buttonCloseHandler(evt) {
  if (evt.keyCode === ESC_CODE) {
    stateViewBasket(`close`);
    document.removeEventListener(`keydown`, buttonCloseHandler);
  }
}

function viewOrderBasket(evt) { // fn for order-page
  evt.preventDefault();
  basketOrder.classList.toggle(`basket-translate`);
  this.textContent = basketOrder.classList.contains(`basket-translate`) ? `Показать корзину` : `Скрыть корзину`;
}

// function stateTheme() {
//   this.classList.toggle(`selector__active`);
//   document.body.classList.toggle(`container--black`);
//   container.classList.toggle(`container--black`);
// }

function contentViewBasket(state) {
  basketFullView.style.display = state ? `` : `none`;
  basketEmptyView.style.display = state ? `` : `block`;
}




// Sect desc add/delete goods and count,cost

function countGoods() {// Счётчик товаров в корзине
  basketCounters.forEach(el => el.textContent = JSON.parse(localStorage.goods).length);
}

function addGoodHandler(evt) { // обр-к кнопки добавления товара
  evt.preventDefault();
  addToStorage(createObjectForStorage(this));
  stateViewBasket(`open`);
}

function createObjectForStorage(btn) {// Формирование объекта для Storage
  let obj = {};
  obj.id = btn.getAttribute(`data-good-id`);
  obj.title = btn.getAttribute(`data-good-title`);
  obj.cost = btn.getAttribute(`data-good-cost`);
  obj.desc = btn.getAttribute(`data-good-desc`);
  obj.img = btn.getAttribute(`data-good-img`);

  return obj;
}

function addToStorage(obj) { // obj - ранее сформированный объект
  goodsArray = JSON.parse(localStorage.goods);

  if (goodsArray.every(el => el.id !== obj.id)) { // Если есть id в массиве 
    goodsArray.push(obj); // если добавляется, то происходит и новый рендер
    localStorage.setItem(`goods`, JSON.stringify(goodsArray));
    renderGoodsList(localStorage.goods);
    contentViewBasket(true);
    countGoods();
    createTotalCost();
  }
}

// Render goods
function renderGoodsList(renderItem) {
  let goods = JSON.parse(renderItem); //render good in basket from LS

  basketContainer.innerHTML = ``;
  if (goods) goods.forEach((el, index) => basketContainer.appendChild(renderOneGood(el, index)));
}

function renderOneGood(element, i) { // render 1 item
  let goodTemplate = document.getElementById(`goods-template`).content; // клон шаблона и внутр-го контента
  let workTemplate = goodTemplate.cloneNode(true).querySelector(`.basket__item`);
  let deleteBtnBasket = workTemplate.querySelector(`[data-basket-delete]`);

  // обработчик для удаления
  deleteBtnBasket.setAttribute(`data-basket-delete`, element.id);
  deleteBtnBasket.addEventListener(`click`, deleteGoodHandler);

  workTemplate.setAttribute(`id-data`, element.id);
  workTemplate.querySelector(`[data-goods-title]`).textContent = element.title;
  workTemplate.querySelector(`[data-goods-desc]`).textContent = element.desc;
  workTemplate.querySelector(`[data-goods-cost]`).setAttribute(`data-goods-cost`, element.cost);
  workTemplate.querySelector(`[data-goods-cost]`).textContent = element.cost.replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, `$1 `);
  workTemplate.querySelector(`[data-goods-img]`).src = element.img;

  // workTemplate.querySelector(`[data-goods-number]`).textContent = element.number;
  // if (element.number) workTemplate.querySelector(`[bags="goods_price"]`).textContent = element.price * element.number;

  return workTemplate;
}

// Delete from Storage
function deleteGoodHandler() {
  let idBlock = this.getAttribute(`data-basket-delete`);
  let deleteBlock = this.parentNode;

  deleteFromStorage(idBlock);
  deleteBlock.remove();
  countGoods();

  // Если все товары удалены
  if (!JSON.parse(localStorage.goods).length) contentViewBasket(false);
  else createTotalCost();
}

function deleteFromStorage(param) {
  goodsArray = JSON.parse(localStorage.goods);
  localStorage.setItem(`goods`, JSON.stringify(goodsArray.filter(el => el.id !== param))); // фильтр значения idBlock
}

// Create Total Cost in Basket
function totalCostFn() {
  const elements = [...document.querySelectorAll(`*[data-goods-cost]`)];
  const costs = elements.map(el => Number(el.getAttribute(`data-goods-cost`)));
  const reducer = (acc, curVal) => acc + curVal;

  return costs.reduce(reducer);
}

function createTotalCost() {
  let basketField = document.querySelector(`.basket__total-in`);
  let subtotalField = document.querySelector(`[data-basket-subtotal]`);
  let deliveryField = document.querySelector(`[data-basket-delivery]`);
  let totalCost = totalCostFn();

  if (subtotalField) subtotalField.textContent = String(totalCost).replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, `$1 `);

  if (deliveryField) {
    let deliveryCost = deliveryField.getAttribute(`data-basket-delivery`);
    totalCost = totalCost + Number(deliveryCost); // для будущего рендера доставки
  }

  basketField.textContent = String(totalCost).replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, `$1 `); // разделение разрядов числа
}