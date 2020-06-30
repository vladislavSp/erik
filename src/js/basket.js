// import ScrollControl from './scrollControl.js';

let basketBtns = [...document.querySelectorAll(`*[data-basket-btn]`)],
    basket = document.querySelector(`[data-basket]`),
    basketViewOrderBtn = document.querySelector(`[data-order-basket="btn"]`),
    basketOrder = document.querySelector(`[data-basket="translate"]`),

    // section for Good Add/Remove
    addGoodBtn = document.querySelector(`[data-good-btn="add"]`),
    basketCounters = [...document.querySelectorAll(`*[data-basket-counter]`)],
    basketFullView = document.querySelector(`[data-basket-full]`),
    basketEmptyView = document.querySelector(`[data-basket-empty]`),
    basketContainer = document.querySelector(`[data-basket-list]`),
    goodsArray = [];

const ESC_CODE = 27;

if (!localStorage.goods) localStorage.goods = JSON.stringify([]);
if (location.pathname === `/order` && !JSON.parse(localStorage.goods).length) location.href = `/`;
if (basketBtns) basketBtns.forEach(el => el.addEventListener(`click`, changeViewBasketHandler));
if (basketViewOrderBtn) basketViewOrderBtn.addEventListener(`click`, viewOrderBasket);
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
  basket.setAttribute(`data-state`, `${state === `open` ? `open` : `close`}`);
  document[state === `open` ? `addEventListener` : `removeEventListener`](`click`, clickCloseHandler);
  document[state ===`open` ? `addEventListener` : `removeEventListener`](`keydown`, buttonCloseHandler);
}

// Listeners
function clickCloseHandler(evt) {
  let target = evt.target.closest(`div[data-basket="basket"]`);
  if (evt.target.hasAttribute(`data-closest-attr`)) return;
  else if (!target) {
    stateViewBasket(`close`);
    document.removeEventListener(`click`, clickCloseHandler);
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
  obj.number = 1;

  if (Number(btn.getAttribute(`data-good-num`)) > 1) obj.maxcount = Number(btn.getAttribute(`data-good-num`));
  else obj.maxcount = false;

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
  } else return;
}


// Render goods
function renderGoodsList(renderItem) {
  let goods = JSON.parse(renderItem); //render good in basket from LS

  basketContainer.innerHTML = ``;
  if (goods) goods.forEach((el, index) => basketContainer.appendChild(renderOneGood(el, index)));
}

function renderOneGood(element) { // render one item
  let goodTemplate = document.getElementById(`goods-template`).content, // клон шаблона и внутр-го контента
      workTemplate = goodTemplate.cloneNode(true).querySelector(`.basket__item`),
      deleteBtnBasket = workTemplate.querySelector(`[data-basket-delete]`),
      counterGoods = workTemplate.querySelector(`[data-signs="listener"]`);

  // обработчик для удаления
  deleteBtnBasket.setAttribute(`data-basket-delete`, element.id);
  deleteBtnBasket.addEventListener(`click`, deleteGoodHandler);

  workTemplate.setAttribute(`id-data`, element.id);
  workTemplate.querySelector(`[data-goods-title]`).textContent = element.title;
  workTemplate.querySelector(`[data-goods-desc]`).textContent = element.desc;
  workTemplate.querySelector(`[data-goods-cost]`).setAttribute(`data-goods-cost`, element.cost);
  workTemplate.querySelector(`[data-goods-cost]`).textContent = element.cost.replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, `$1 `);
  workTemplate.querySelector(`[data-goods-img]`).src = element.img;

  if (element.maxcount) {
    workTemplate.querySelector(`[data-goods-number]`).textContent = element.number;
    counterGoods.setAttribute(`data-good-count`, `${element.id}`);
    counterGoods.setAttribute(`data-max-count`, element.maxcount);
    counterGoods.addEventListener(`click`, controlNumberHandler);
  } else {
    counterGoods.remove();
  }

  return workTemplate;
}


// Delete from Storage
function deleteGoodHandler() {
  let idBlock = this.getAttribute(`data-basket-delete`);
  let deleteBlock = this.parentNode.closest(`div.basket__item`);

  deleteFromStorage(idBlock);
  deleteBlock.remove();
  countGoods();

  // Если все товары удалены
  if (!JSON.parse(localStorage.goods).length) {
    contentViewBasket(false);
    if(location.pathname === `/order`) location.href = `/`; // redirmain
  }
  else createTotalCost();
}

function deleteFromStorage(param) {
  goodsArray = JSON.parse(localStorage.goods);
  localStorage.setItem(`goods`, JSON.stringify(goodsArray.filter(el => el.id !== param))); // фильтр значения idBlock
}

// Create Total Cost in Basket
function totalCostFn() {
  let sum = 0;
  goodsArray = JSON.parse(localStorage.goods);
  goodsArray.forEach(el => sum = sum + Number(el.cost) * el.number);

  return sum;
}

function createTotalCost() {
  let basketField = document.querySelector(`.basket__total-in`),
      subtotalField = document.querySelector(`[data-basket-subtotal]`),
      deliveryField = document.querySelector(`[data-basket-delivery]`),
      orderBtnCost = document.querySelector(`.order__btn-cost`);

  let totalCost = totalCostFn();

  if (subtotalField) subtotalField.textContent = String(totalCost).replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, `$1 `);

  if (deliveryField && deliveryField.getAttribute('data-basket-delivery')) {
    deliveryField.textContent = `${deliveryField.getAttribute('data-basket-delivery')} ₽`;
    totalCost = totalCost + Number(deliveryField.getAttribute('data-basket-delivery')); // для будущего рендера доставки
  } else if (deliveryField && deliveryField.getAttribute('data-basket-delivery') === ``) deliveryField.textContent = `Определяется`;

  // Кнопка заказа
  if (orderBtnCost) orderBtnCost.textContent = totalCost;

  basketField.textContent = String(totalCost).replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, `$1 `); // разделение разрядов числа

  return totalCost;
}

function controlNumberHandler(event) {
  let target = event.target,
      good = this.getAttribute(`data-good-count`),
      maxCount = Number(this.getAttribute(`data-max-count`)),
      fieldCount = this.querySelector(`.basket__number-good`);

  if (target.closest(`.basket__minus`)) goodsCountChange(good, false, fieldCount);
  else if (target.closest(`.basket__plus`)) goodsCountChange(good, true, fieldCount, maxCount);
  else return;
}

function goodsCountChange(good, state, field, max) {
  goodsArray = JSON.parse(localStorage.goods);
  let searchGood = goodsArray.find(el => el.id === good);
  
  searchGood.number = countNumber(state, field, searchGood.number, max);

  localStorage.setItem("goods", JSON.stringify(goodsArray));
  createTotalCost();
}

function countNumber(state, field, num, max) { // true - + или -
  if (state) num = num === max ? max : num + 1;
  else num = num === 1 ? 1 : num - 1;

  field.textContent = num;

  return num;
}



// NEW FUNC - update Basket from server

function updateStoreFromServer() {
  axios({
    method: 'get',
    url: `${location.origin}/goods`,
    data: ``,
  }).then(function (response) {
    let obj = response.data.replace("},]", "}]");
    localStorage.setItem('storeGoods', obj);
  }).then(() => {
    comparisonStore();
  });
}

function comparisonStore() {
  let storeGoods = JSON.parse(localStorage.storeGoods); // эталонный товар с сервера 
  let goods = JSON.parse(localStorage.goods); //

  goods.forEach(el => {
    storeGoods.forEach(newEl => {
      if (el.id === newEl.id) {
        console.log(el.maxcount, Number(newEl.num));

        if (el.maxcount > Number(newEl.num)) console.log('Нужно перерендерить');
        else if (el.maxcount <= Number(newEl.num)) console.log('Ничего не нужно делать');
      }
    })
  });
}

updateStoreFromServer();

export default createTotalCost;