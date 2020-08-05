let imageNavBlocks = Array.from(document.querySelectorAll('.view_nav_img')), // изображения в навигации
    imageBlocks = Array.from(document.querySelectorAll('.view_photo_img')), // основные скролящиеся изображения
    contentBlock = document.querySelector('.view_photo'), // блок-обертка со всеми изображениями
    descChanges = Array.from(document.querySelectorAll('.view_cont_desc_top_item')),
    counterGoods = document.querySelectorAll('*[bags="count"]'), // счётчик товаров
    goodsContainer = document.querySelector('.basket_goods_contain'),
    wishListContainer = document.querySelector('.wishlist_grid'),
    wishlistEmpty = document.querySelector('.wishlist_empty'),
    basket = document.querySelector('[el="bags"]'),
    filterMobileBtn = document.querySelector('[open-popup="filter-mb"]'),
    basketFinalCheckout = document.querySelector('.button_bg_basket_popup'),

// меню -логин
    mainMenu = document.querySelector('.menu'),
    blockLogin = mainMenu.querySelector('[block-login="login"]'),
    blockLogout = mainMenu.querySelector('[block-login="logout"]'),
    accountNames = Array.from(document.querySelectorAll('*[data-login="name"]')),
    profileBtns = Array.from(document.querySelectorAll('[profile-btn="btn"]')),
    basketBtn = document.querySelector('[basket-btn="profile"]'),

// переменные для LOCALSTORAGE
    goodObject = {}, contactsObj = {}, goodsArray = [], wishlistArray = [],
    wishlistBtnsAdd = Array.from(document.querySelectorAll('*[wishlist-bth-add]')),
    basketEmpty = document.querySelector('[bags="empty"]'), // пустая корзина
    basketFull = Array.from(document.querySelectorAll('*[bags="full"]')); // корзина с товаром

const FIXED_FREE_SHIP_PRICE = 300; //freeshiping
const ESC_CODE = 27;

Array.prototype.remove = function(value) { // функция для удаления конкретного элемента массива
  var idx = this.indexOf(value);
  if (idx != -1) return this.splice(idx, 1); // 2-ой параметр - число элементов, которые нужно удалить
  return false;
}

window.openPopupBtn = function () { // глобал–функция для открытия попапов
  let selectPopup = this.getAttribute('open-popup'); // selectPopup - попап по аттр-ту
  scrollControl('lock');

  popups.map(el => {
    if (el.getAttribute(`popup`) === selectPopup) {
      el.style.display = 'flex';
      el.style.height = window.innerHeight + 'px';
      console.log(el);
      el.setAttribute('statePopup', 'open');
      document.addEventListener('keydown', closeKeyHandler);
      el.addEventListener('mousedown', closeClickHandler); // click
    }
  });
}

if (filterMobileBtn) filterMobileBtn.addEventListener('click', openPopupBtn);

if (localStorage.hash) { // Если пользователь авторизован рендер из БД
  viewAutorizationUser(blockLogin, blockLogout, accountNames, profileBtns);
  synchronizeServerData();
}

// setState LocalStorage
if (!localStorage.goodsArray) localStorage.goodsArray = JSON.stringify([]);
if (!localStorage.wishlistArray) localStorage.wishlistArray = JSON.stringify([]);


if (goodsContainer) { // рендер корзины
  goodsArray = JSON.parse(localStorage.goodsArray);

  if (goodsArray && goodsArray.length) {
    updateCounerBasket();  // обновление счетчика корзины на всех страницах
    renderGoodsInBasket(localStorage.goodsArray); // рэндер товаров в корзине
    viewBasketPopup(true); // показ внутреннего содержимого корзины, если в корзине есть товар
  }
  else if (!goodsArray.length) viewBasketPopup(false); // показывается пустая корзина
}

if (!localStorage.hash) {
  if (wishListContainer) { // рендер Wishlist
    wishlistArray = JSON.parse(localStorage.wishlistArray);
    if (wishlistArray && wishlistArray.length) {
      renderGoodsInWishlist();

    if (wishlistBtnsAdd.length > 0) {
      wishlistBtnsAdd = Array.from(document.querySelectorAll('*[wishlist-bth-add]'));
      wishlistBtnsAdd.map(el => el.addEventListener('click', addGoodHandler));
    }
    viewEmptyWishlist(true);
    } else if (!wishlistArray.length) viewEmptyWishlist(false);
  }
}

if (basketFinalCheckout) basketFinalCheckout.addEventListener('click', checkedAuthorizationUser);

function checkedAuthorizationUser(evt) { // проверка авторизации при оформлении заказа
  evt.preventDefault();
  if (localStorage.hash) document.location.href = `${this.getAttribute('href')}`;
  else if (!localStorage.hash) openAuthPopup('auth'); //'Не авторизаван'
}

function viewAutorizationUser(login, logout, accNames, profileBtns) {
  login.style.display = 'none';
  logout.style.display = 'block';
  if (profileBtns) profileBtns.map(el => el.setAttribute('state', 'enable'));
  if (basketBtn) basketBtn.setAttribute('state', 'enable');
  setContactsObject(); // иниц-я нач-го hash, чтобы забирать с сервера правильный ContactObject
}

async function setContactsObject() { // Запрос к серверу для ред–я данных пользователя
  axios({
    method: 'post',
    url: 'back/profile.php',
    data: `hash=${localStorage.getItem('hash')}`
  }).then(await function (response) {
    if (response.data != 'error' && response.status === 200) {
      localStorage.setItem('contactsObj', JSON.stringify(response.data));
      accountNames.map(el => el.textContent = response.data.name);
    }
  });
}

function editProfileSend(obj) {
  axios({
    method: 'post',
    url: 'back/profile_edit.php',
    data: `hash=${localStorage.getItem('hash')}&name=${obj.name}&secondname=${obj.secondname}&address=${obj.address}&contact=${obj.contact}`
  }).then(function (response) {
    if (response.data != 'error') {
      localStorage.setItem('contactsObj', JSON.stringify(obj));
      accountNames.map(el => el.textContent = obj.name);
    }
  });
}

function editAllProfileSend(obj) {
  axios({
    method: 'post',
    url: 'back/profile_edit.php',
    data: `hash=${localStorage.getItem('hash')}&name=${obj.name}&secondname=${obj.secondname}&address=${obj.address}&phone=${obj.contact}&mail=${obj.mail}&pass_new=${obj.newPass}`
  }).then(function (response) {
    if (response.data != 'error') {
      localStorage.setItem('contactsObj', JSON.stringify(obj));
      localStorage.setItem('hash', response.data);
      accountNames.map(el => el.textContent = obj.name);
    }
  });
}



async function synchronizeServerData(state) {
  if (goodsContainer) await basketDownloadData(state);

  if (wishListContainer) {
    await wishlistUploadData();
    await wishlistDownloadData();
  }
}

///// Синхронизация с сервером \\\\\\
function basketUploadData(data = false, login = false) {
  let goodsArray = JSON.parse(localStorage.goodsArray);

  if (goodsArray) goodsArray.forEach(el => basketUpload(el));
  if (login) basketDownloadData(true);
}

async function basketUpload(obj) { // загрузка товаров на сервер
  axios({
    method: 'post',
    url: `back/bags.php`,
    data: `hash=${localStorage.getItem('hash')}&type=insert&article=${obj.article}&name=${obj.name}&size=${obj.size}&number=${obj.number}&price=${obj.price}&img=${obj.img}&sendid=${obj.sendid}`
  }).then(await basketDownloadData);
}

async function basketDownloadData(state = false) { // запись данных с сервера в LocalStorage ( и в отдельных случаях рендер! )
  axios({
    method: 'post',
    url: 'back/bags.php',
    data: `hash=${localStorage.getItem('hash')}&type=select`
  }).then(await function (response) {
    if (response.data != 'error') localStorage.setItem('goodsArray', JSON.stringify(response.data));

    if (state) {
        updateCounerBasket();
        renderGoodsInBasket(localStorage.goodsArray);
        if (response.data.length > 0) viewBasketPopup(true);
        else viewBasketPopup(false);
    }
  });
}

function basketUpdate() { // main updata +/–
  let goodsArray = JSON.parse(localStorage.goodsArray);
  goodsArray.forEach(el => basketUpdateData(el));
}

function basketUpdateData(obj) { // обновление на сервере
  axios({
    method: 'post',
    url: 'back/bags.php',
    data: `hash=${localStorage.getItem('hash')}&type=update&id=${obj.id}&number=${obj.number}`
  })
}

function basketDeleteData(obj) { // удаление из корзины
  axios({
    method: 'post',
    url: 'back/bags.php',
    data: `hash=${localStorage.getItem('hash')}&type=delete&id=${obj.id}`
  });
}


/////////////  BASKET RENDER \\\\\\\\\\\\\\\\
function updateCounerBasket() { // функция для обновления счетчика корзины (из localStorage)
  counterGoods.forEach(el => {
    if (localStorage.goodsArray) el.textContent = JSON.parse(localStorage.goodsArray).length;
    else el.textContent = 0;
  });
}

function viewBasketPopup(checkFlag) { // Функция для скрытия/показа попапа
  if (basketEmpty && basketFull) {
    basketEmpty.style.display = checkFlag ? '' : 'block';
    basketFull.forEach(el => el.style.display = checkFlag ? '' : 'none');
  }
}

function viewPopup() {
  basket.style.display = 'flex'; // scrollControl('lock');
}

function addGoodHandler(event) {
  event.preventDefault();
  if (this.getAttribute('size-card') !== 'false') {
    renderLocalStorageObj(this, 'goodsArray');
    if (localStorage.hash) basketUploadData(JSON.parse(localStorage.goodsArray));
    updateCounerBasket();
    renderGoodsInBasket(localStorage.goodsArray);
    viewBasketPopup(true);
    viewPopup();
  } else {
    let selectBlocks = Array.from(document.querySelectorAll('*[data-size-card]'));
    let addBtnBasket = document.querySelector('[add-btn="basket"]');
    let wishlistBtn = document.querySelector('[add-btn="wishlist"]');

    addBtnBasket.setAttribute('state', 'notsize');
    addBtnBasket.textContent = 'Выберите размер';
    wishlistBtn.setAttribute('state', '');
    wishlistBtn.querySelector('.view_cont_button_whishlist_txt').textContent = 'Добавить в избранное';

    selectBlocks.forEach(el => {
        el.style.borderColor = '#FB865B';
        el.style.backgroundColor = '#F93535';
        el.style.color = 'white';
    });
  }
}

function renderLocalStorageObj(btn, nameLocalStorage) {  // Наполнение LocalStorage
  let article = btn.getAttribute('article'), // Содержимое для LocalStorage (из аттрибутов кнопки)
      name = btn.getAttribute('title'),
      size = btn.getAttribute('size-card'),
      price = btn.getAttribute('cost'),
      img = btn.getAttribute('image'),
      url = btn.getAttribute('url'),
      id = '', sendid = btn.getAttribute('sendid');

  let goodObject = {article, name, 'number': 1, img, price, size, id, url, sendid};
  // добавление товара в localStorage без дубликатов
  localStorage.setItem(`${nameLocalStorage}`, JSON.stringify(renderItemsLocalStorage(goodObject, nameLocalStorage)));
}

function renderItemsLocalStorage(obj, nameLocalStorage) {  // возвр массива товаров без дубликатов
  let goodsArray = JSON.parse(localStorage[`${nameLocalStorage}`]);
  goodsArray.push(obj);

  return removeDuplicates(goodsArray);
}

function removeDuplicates(arr) {
  const result = [];
  const duplicatesIndices = [];

  arr.forEach((current, index) => {
    if (duplicatesIndices.includes(index)) return;

    result.push(current);

    for (let comparisonIndex = index + 1; comparisonIndex < arr.length; comparisonIndex++) {

      const comparison = arr[comparisonIndex];
      const currentKeys = Object.keys(current);
      const comparisonKeys = Object.keys(comparison);

      if (currentKeys.length !== comparisonKeys.length) continue;

      const currentKeysString = currentKeys.sort().join("").toLowerCase();
      const comparisonKeysString = comparisonKeys.sort().join("").toLowerCase();

      if (currentKeysString !== comparisonKeysString) continue;

      // Проверяем индексы ключей
      let valuesEqual = true;
      for (let i = 0; i < currentKeys.length; i++) {
        const key = currentKeys[i];
        if (key === 'number') continue; // исключить number/id/url
        if (key == 'id') continue;
        if (key == 'url') continue;
        if ( current[key] !== comparison[key] ) {
          valuesEqual = false;
          break;
        }
      }
      if (valuesEqual) duplicatesIndices.push(comparisonIndex);
    } // Конец цикла
  });
  return result;
}  // ф–ция для удаления дубликатов объектов из массива

function renderGoodsInBasket(renderItem) { // рэндер товаров в корзину из LocalStorage
  let goods = JSON.parse(renderItem);

  goodsContainer.innerHTML = '';
  if (goods) goods.forEach((el, index) => goodsContainer.appendChild(renderOneGood(el, index)));

  createTotalCost(); // подсчёт цены
  changeQuantityGoods(); // добавление обработчиков кнопок для плюса и минуса
}

function renderOneGood(element, i) { // Наполнение шаблона (рендер одного элемента корзины)
  let goodsTemplate = document.getElementById('goods-template').content; // клон шаблона и внутр-го контента
  let workTemplate = goodsTemplate.cloneNode(true).querySelector('.goods');
  let deleteBtnBasket = workTemplate.querySelector('[data-goods-remove]');

  workTemplate.setAttribute('id-data', i);
  deleteBtnBasket.setAttribute('data-goods-remove', i);
  deleteBtnBasket.addEventListener('click', deleteGood);
  workTemplate.querySelector('[data-goods-title]').textContent = element.name;
  workTemplate.querySelector('[data-goods-article]').textContent = element.article;
  workTemplate.querySelector('[data-goods-size]').textContent = element.size;
  workTemplate.querySelector('[data-goods-number]').textContent = element.number;
  workTemplate.querySelector('[data-img]').src = element.img; // изображение в корзине
  if (element.number) workTemplate.querySelector('[bags="goods_price"]').textContent = element.price * element.number;

  return workTemplate;
}

function deleteGood() {   // Удаление элементов из корзины
  let deleteNumber = this.getAttribute('data-goods-remove'),
      goodsBasket = document.querySelector(`*[id-data="${deleteNumber}"]`),
      goodsArray = JSON.parse(localStorage.goodsArray); // объект, который нужно удалить из хранилища

  if (localStorage.hash) basketDeleteData(goodsArray[deleteNumber]); // запрос на сервер для удаления элемента

  goodsArray.splice(goodsArray.indexOf(goodsArray[deleteNumber]), 1); // индекс удаляемого элемента
  localStorage.setItem('goodsArray', JSON.stringify(goodsArray)); // обновление localStarage

  if (goodsArray.length === 0) viewBasketPopup(false);
  deleteBloksHandlers(deleteNumber);
  goodsBasket.remove();
  updateCounerBasket();
  createTotalCost();
  this.removeEventListener('click', deleteGood);

  // перерендер id в корзине
  let allGoodsInBasket = Array.from(document.querySelectorAll('.goods'));
  let removeBtns = Array.from(document.querySelectorAll('*[data-goods-remove]'));

  removeBtns.forEach((el, index) => el.setAttribute('data-goods-remove', index));
  allGoodsInBasket.forEach((el, index) => el.setAttribute('id-data', index));
}

function deleteBloksHandlers(num) { // удаление обработчиков клика по – и +, если товар удален из корзины
  let blockGood = document.querySelector(`[id-data="${num}"]`);
  blockGood.removeEventListener('click', changeQuantityGood);
}

function createTotalCost() {  // формирование итоговой стоимости
  let prices = Array.from(document.querySelectorAll('*[bags="goods_price"]')), // цена товара в попапе
      initCost = document.querySelector('[bags="price"]'), // цена без доставки
      totalCost = document.querySelector('[bags="total"]'), //
      cdekPopupCost = document.querySelector('[cdek-cost="popup"]'),
      totalPrice = 0,
      discount = document.querySelector('[bags="code"]'), // поле со скидкой
      numberDiscount = Number(discount.textContent);
      courierCost = document.querySelector('[bags="courier-cost"]'),
      courierText = document.querySelector('[bags="courier-text"]');

  prices.forEach(el => totalPrice += Number(el.textContent));// let num = Number(el.textContent);

  if (cdekPopupCost) cdekPopupCost.textContent = `${totalPrice}`;

  // function for the discount code - on the future
  if (initCost) initCost.textContent = `${totalPrice}`;

  // показ плашки для бесплатной доставки
  let priceMoreText = document.querySelector('[spend-cost="text"]'),
      priceMoreCost = document.querySelector('[spend-cost="price"]');

  if (priceMoreText) {
    if (totalPrice >= FIXED_FREE_SHIP_PRICE) priceMoreText.style.display = 'none';
    else if (totalPrice <= FIXED_FREE_SHIP_PRICE) {
      priceMoreText.style.display = '';
      priceMoreCost.textContent = FIXED_FREE_SHIP_PRICE - totalPrice;
    }
  }

  // Для самой корзины, в которой доставка
  if (!courierCost) totalCost.textContent = `${totalPrice - numberDiscount}`;
  else if (courierCost) totalCost.textContent = `${totalPrice - numberDiscount + Number(courierCost.textContent)}`;
}

function changeQuantityGoods() { // Обработчиков событий для кнопок + и –
  let blockGoods = Array.from(document.querySelectorAll('*[id-data]')); // обработчик на весь блок товара
  blockGoods.forEach(el => el.addEventListener('click', changeQuantityGood));
}

function changeQuantityGood(event) {
  let target = event.target;
  let countField = this.querySelector('[data-goods-number]'); // type Number - значение количества товара
  let countValue = Number(countField.textContent);
  let price = this.querySelector('[bags="goods_price"]'); // цена товара в карточке
  let numberArray = this.getAttribute('id-data');

  if (localStorage.goodsArray) {
    let oneGoodsPrice = JSON.parse(localStorage.goodsArray)[numberArray].price;
    let goodsArray = JSON.parse(localStorage.goodsArray);

    if (target.hasAttribute('data-goods-minus')) {
      if (countValue === 1) countField.textContent = 1;
      else updateNumberGoods(false); // – один товар
    }
    else if (target.hasAttribute('data-goods-plus')) updateNumberGoods(true); // + ещё один товар

    function updateNumberGoods(sign) {
      countField.textContent = sign ? countValue + 1 : countValue - 1;
      goodsArray[numberArray].number = Number(countField.textContent);

      localStorage.setItem("goodsArray", JSON.stringify(goodsArray)); // update localStorage

      if (localStorage.hash) basketUpdate();

      price.textContent = sign ? `${Number(price.textContent) + Number(oneGoodsPrice)}` : `${Number(price.textContent) - Number(oneGoodsPrice)}`;
      createTotalCost();
    }
  }
}



///// WISHLIST DOWNLOAD \\\\\
function wishlistUploadData() {
  wishlistArray = localStorage.wishlistArray.length ? JSON.parse(localStorage.wishlistArray) : [];
  if (wishlistArray.length) wishlistArray.forEach(el => wishlistUpload(el, `wishlist`));
}

function wishlistDownloadData() {
  axios({
    method: 'post',
    url: 'back/wishlist.php',
    data: `hash=${localStorage.getItem('hash')}&type=select`
  }).then(function (response) {
    if (response.data != 'error') {
      localStorage.setItem('wishlistArray', JSON.stringify(response.data));
      renderGoodsInWishlist();
        if (response.data.length > 0) viewEmptyWishlist(true); // показ wishlist-a
        else viewEmptyWishlist(false);
    }
  });
}

async function wishlistUpload(obj) { // загрузка товаров на сервер
  axios({
    method: 'post',
    url: `back/wishlist.php`,
    data: `hash=${localStorage.getItem('hash')}&type=insert&article=${obj.article}&name=${obj.name}&size=${obj.size}&number=${obj.number}&price=${obj.price}&img=${obj.img}&url=${obj.url}`
  }).then(await function (response) {
    //if (response.data != 'error') //console.log('Данные Wishlist-а загружены!');
  });
}

function wishlistDeleteData(obj) { // удаление с сервера
  axios({
    method: 'post',
    url: 'back/wishlist.php',
    data: `hash=${localStorage.getItem('hash')}&type=delete&id=${obj.id}`
  })
  // .then(function (response) { } );
}

// render товаров в Wishlist-e
function renderGoodsInWishlist() {
  let goodsWishlist = JSON.parse(localStorage.wishlistArray);
  wishListContainer.innerHTML = '';
  goodsWishlist.forEach((el, index) => wishListContainer.appendChild(renderOneGoodWishlist(el, index)));
}

function renderOneGoodWishlist(element, i) {
  let wishlistTemplate = document.getElementById('card-template').content;
  let wishlistWorkTemplate = wishlistTemplate.cloneNode(true).querySelector('.card');
  let btnAddBasket = wishlistWorkTemplate.querySelector('[wishlist-bth-add]');

  wishlistWorkTemplate.setAttribute('wishlist-card', i);
  wishlistWorkTemplate.href = element.url;
  wishlistWorkTemplate.querySelector('[wishlist-img-template]').style.backgroundImage = `url(${element.img})`;
  wishlistWorkTemplate.querySelector('[wishlist-title-template]').textContent = element.name;
  wishlistWorkTemplate.querySelector('[wishlist-cost-template]').textContent = element.price;
  wishlistWorkTemplate.querySelector('[wishlist-size-template]').textContent = element.size;

  btnAddBasket.addEventListener('click', addGoodHandler);
  btnAddBasket.setAttribute('wishlist-bth-add', i);
  btnAddBasket.setAttribute('image', element.img);
  btnAddBasket.setAttribute('article', element.article);
  btnAddBasket.setAttribute('title', element.name);
  btnAddBasket.setAttribute('size-card', element.size);
  btnAddBasket.setAttribute('cost', element.price);

  wishlistWorkTemplate.querySelector('.card_img_remove').setAttribute('remove-wishlist-btn', i);
  wishlistWorkTemplate.querySelector('.card_img_remove').addEventListener('click', removeWishlistHandler);

  return wishlistWorkTemplate;
}

function removeWishlistHandler(event) {
  event.preventDefault();

  let deleteNumberWish = this.getAttribute('remove-wishlist-btn'),
      wishcard = document.querySelector(`*[wishlist-card="${deleteNumberWish}"]`),
      btnAddBasket = document.querySelector(`*[wishlist-bth-add="${deleteNumberWish}"]`);
      wishlistArray = JSON.parse(localStorage.wishlistArray);

  if (localStorage.hash) wishlistDeleteData(wishlistArray[deleteNumberWish]);

  wishlistArray.splice(wishlistArray.indexOf(wishlistArray[deleteNumberWish]), 1);
  localStorage.setItem('wishlistArray', JSON.stringify(wishlistArray));

  if (wishlistArray.length === 0) viewEmptyWishlist(false);

  this.removeEventListener('click', removeWishlistHandler);
  btnAddBasket.removeEventListener('click', window.addGoodHandler);
  wishcard.remove();

  // перерендер id в корзине
  let allWishlistCards = Array.from(document.querySelectorAll('*[wishlist-card]'));
  let removeWishlistBtns = Array.from(document.querySelectorAll('*[remove-wishlist-btn]'));
  let allBasketBtns = Array.from(document.querySelectorAll('*[wishlist-bth-add]'))

  removeWishlistBtns.forEach((el, index) => el.setAttribute('remove-wishlist-btn', index));
  allWishlistCards.forEach((el, index) => el.setAttribute('wishlist-card', index));
  allBasketBtns.forEach((el, index) => el.setAttribute('wishlist-bth-add', index));
}

function viewEmptyWishlist(flag) {
  wishListContainer.style.display = flag ? '' : 'none';
  wishlistEmpty.style.display = flag ? '' : 'flex';
}



let basketMainBlock = document.querySelector('.basket_block');

if (basketMainBlock) { ///// СТРАНИЦА КОРЗИНЫ \\\\\\\
  var  basketStepOne = basketMainBlock.querySelector('[basket-step-one="hidden"]'), // БЛОК С РЕДАКТИРОВАНИЕМ ДАННЫХ
      basketCheckbox = basketMainBlock.querySelector('[basket-address-check="checkbox"]'),

      // Подзаголовки первого блока (для авторизации) – приветствие и
      basketHelloName = basketMainBlock.querySelector('[info-hello="complete"]'),
      basketAddressTitle =  basketMainBlock.querySelector('[address="complete"]'),
      basketAddress = document.getElementById('address-person'),
      editTextAddress = basketMainBlock.querySelector('[input-edit-text="address"]'),
      editTextShipMethod = basketMainBlock.querySelector('[input-edit-text="method"]'),

      editBtnAddress = basketMainBlock.querySelector('[btn-basket="edit-address"]'),
      editBtnShipMethod = basketMainBlock.querySelector('[btn-basket="edit-method"]'),

      basketPointNav = document.querySelectorAll('*[basket-point-nav]'), // пагинация

      basketFields = Array.from(basketMainBlock.querySelectorAll('*[basket-address]')),

      deliveryMoneyBlock = document.querySelector('[bags="courier-text"]'),
      btnContinueShip = basketMainBlock.querySelector('[basket-btn="address"]'), // кнопка для перехода к выбору способа доставки
      btnContinuePay = basketMainBlock.querySelector('[basket-btn="continue-pay"]'),

      basketInfoOne = basketMainBlock.querySelector('[basket-step-one="complete"]'), // ГОТОВЫЙ 1-Й ИНФО БЛОК
      basketBlockTwo = basketMainBlock.querySelector('[basket-step-two="begins"]'), // ВТОРОЙ БЛОК С ВЫБОРОМ
      basketBlockTwoComplete = basketMainBlock.querySelector('[basket-step-two="complete"]'),
      basketBlockThree = basketMainBlock.querySelector('[basket-step-three="begins"]');

  var moveSecondStep, moveThirdStep;

  if (localStorage.contactsObj) { // Заполнение из JSON-a полей ввода, если адрес был введён ранее
      contactsObj = JSON.parse(localStorage.contactsObj);

      basketFields.forEach(el => { //Заполнение полей ввода из LocalStorage
      for (let key in contactsObj) {
        if (contactsObj.hasOwnProperty(key)) {
          if (el.getAttribute('basket-address') === key) el.value = contactsObj[key];
        }
      }
    });
  }

  if (localStorage.getItem('contactsObj') && localStorage.memoryState === '1') {
    contactsObj = JSON.parse(localStorage.contactsObj);

    basketFields.forEach(el => { //Заполнение полей ввода из LocalStorage
      for (let key in contactsObj) {
        if (contactsObj.hasOwnProperty(key)) {
          if (el.getAttribute('basket-address') === key) el.value = contactsObj[key];
        }
      }
    });

    basketCheckbox.setAttribute('state', 'enable');
    selectedStepBlock(basketStepOne, basketInfoOne, basketBlockTwo);
    editTextAddress.textContent = `${contactsObj['name']} ${contactsObj['secondname']}, ${contactsObj['contact']}, ${contactsObj['address']}`;
    basketPointNav[1].setAttribute('state', 'init');
    editBtnAddress.addEventListener('click', editFirstBlockAddress); // обр–к событий для ред–я адреса

    // При авторизации подставляем другое название
    basketAddressTitle.textContent = `МОЙ АДРЕС`;
    basketHelloName.textContent = `Привет, ${JSON.parse(localStorage.contactsObj).name}`;
  }

  basketFields.map(el => el.addEventListener('input', monitoringInputHandler));
  basketFields.map(el => el.addEventListener('focus', focusInputHandler));
  btnContinueShip.addEventListener('click', checkedInputHandler);
  basketCheckbox.addEventListener('click', basketCheckboxHandler);

  function monitoringInputHandler() { // Обработчики инпутов
    if (this.value !== '') {
      let target = this.getAttribute('basket-address'); // имя свойства
      contactsObj[`${target}`] = this.value;
    }
  }

  function basketCheckboxHandler() {
    if (this.getAttribute('state') === 'enable') this.setAttribute('state', 'disable');
    else if (this.getAttribute('state') === 'disable') this.setAttribute('state', 'enable');
  }

  function selectedStepBlock(currentHid, currentMin, nextEl) { // Скрытие ред-го блока и показ следующего
    currentHid.classList.add('block__hidden');
    currentMin.classList.remove('block__hidden');

    if (nextEl) nextEl.classList.remove('block__hidden');
  }

  function checkedInputHandler() { //ПЕРЕХОД КО ВТОРОМУ БЛОКУ
    checkedInputs(basketFields);
    moveSecondStep = basketFields.every(current => current.value !== ''); // ПРОВЕРКА МАССИВА ИНПУТОВ НА ЗАПОЛНЕНИЕ

    if (moveSecondStep) {
      if (basketCheckbox.getAttribute('state') === 'enable') localStorage.setItem('memoryState', 1);
      else if (basketCheckbox.getAttribute('state') === 'disable') localStorage.setItem('memoryState', 0);

      contactsObj.address = basketAddress.value;

      editProfileSend(contactsObj);

      if (this.hasAttribute('init')) selectedStepBlock(basketStepOne, basketInfoOne);
      else selectedStepBlock(basketStepOne, basketInfoOne, basketBlockTwo);

      basketHelloName.textContent = `Привет, ${contactsObj['name']}`;
      editTextAddress.textContent = `${contactsObj['name']} ${contactsObj['secondname']}, ${contactsObj['contact']}, ${contactsObj['address']}`;
      editBtnAddress.addEventListener('click', editFirstBlockAddress);
      this.setAttribute('init', 1);
      basketPointNav[1].setAttribute('state', 'init');
    }
  }

  function editFirstBlockAddress() {
    basketStepOne.classList.remove('block__hidden'); // cкрытие 1-го шага и показ 2-го
    basketInfoOne.classList.add('block__hidden');
  }



  // SECOND BLOCK – shiping method
  var selectBtnShipMethod = Array.from(basketMainBlock.querySelectorAll('*[shipping-method-btn]'));
  var btnStepThird = basketMainBlock.querySelector('[basket-btn="shipping"]');
  var courierCost = document.querySelector('[bags="courier-cost"]');

// если есть заполненное поле доставки LOCALSTORAGE
  if (localStorage.getItem('shipingMetod') && localStorage.memoryState === '1') {
    selectBtnShipMethod.forEach(el => {
      if (el.getAttribute('shipping-method-btn') === `${localStorage.getItem('shipingMetod')}`) {
        el.setAttribute('state', 'enable');
        courierCost.textContent = el.getAttribute('data-cost-ship');
        createTotalCost(); // вычислить стоимость при загрузке страницы
        deliveryMoneyBlock.setAttribute('state', 'enable');
      }
    });

    selectedStepBlock(basketBlockTwo, basketBlockTwoComplete, basketBlockThree);
    editBtnShipMethod.addEventListener('click', editSecondBlockMethod);
    basketPointNav[2].setAttribute('state', 'init');
  }

  selectBtnShipMethod.forEach(el => el.addEventListener('click', selectShipingMethod));
  btnStepThird.addEventListener('click', checkedHasShipMethod);

  function selectShipingMethod() {
    selectBtnShipMethod.forEach(el => el.setAttribute('state', 'disable'));
    this.setAttribute('state', 'enable');
    courierCost.textContent = this.getAttribute('data-cost-ship');
    deliveryMoneyBlock.setAttribute('state', 'enable');
    createTotalCost();
    localStorage.setItem('shipingMetod', this.getAttribute('shipping-method-btn'));
    localStorage.setItem('shipingMethodDesc', this.querySelector('.basket_info_bottom_button_txt').textContent);
    editTextShipMethod.textContent = this.querySelector('.basket_info_bottom_button_txt').textContent;
  }

  function checkedHasShipMethod() {
    moveThirdStep = selectBtnShipMethod.every(current => current.hasAttribute('state')); // ПРОВЕРКА кнопок на выбор пункта доставки
    if (moveThirdStep) {
      selectedStepBlock(basketBlockTwo, basketBlockTwoComplete, basketBlockThree);
      editBtnShipMethod.addEventListener('click', editSecondBlockMethod);
      basketPointNav[2].setAttribute('state', 'init');
    }
  }

  function editSecondBlockMethod() {
    basketBlockTwoComplete.classList.add('block__hidden');
    basketBlockTwo.classList.remove('block__hidden');
  }



  // THIRD BLOCK - paymentMethod
  var selectBtnPaymentMethod = Array.from(basketMainBlock.querySelectorAll('*[payment-method-btn]')),
      basketTotalBlock = basketMainBlock.querySelector('[basket-step-end="total"]'),
      basketWrapper = basketMainBlock.querySelector('[basket-complete-block]'),
      paymentBtn = document.querySelector('[payment-btn="pay"]'),
      navigationOrder = document.querySelector('[navigation-order="basket"]'),
      totalCost = document.querySelector('[bags="total"]'),
      paymentSystem, idOrder;

  if (localStorage.getItem('completelyForm') === '1' && localStorage.memoryState === '1') { // Если заполнены все поля LOCALSTORAGE
    basketWrapper.setAttribute('state', 'initOrder');
    navigationOrder.style.display = 'none';
    paymentBtn.setAttribute('state', 'enable');

    editSecondBlockMethod();

    selectBtnPaymentMethod.forEach(el => {
      if (el.getAttribute('payment-method-btn') === `${localStorage.getItem('paymentMethod')}`) {
        el.setAttribute('state', 'enable');
      }
    });
    // if (localStorage.getItem('paymentMethod') === "yandex") paymentBtn.textContent = `ЯНДЕКС.ДЕНЬГИ`;
    // else paymentBtn.textContent = `ОПЛАТА С PAYPAL`;
  }

  selectBtnPaymentMethod.forEach(el => el.addEventListener('click', selectPaymentMethod));
  btnContinuePay.addEventListener('click', checkedContinuePay);
  paymentBtn.addEventListener('click', checkedFinalSendOrder);

  function selectPaymentMethod() {
    selectBtnPaymentMethod.forEach(el => el.setAttribute('state', 'disable'));
    this.setAttribute('state', 'enable');
    paymentSystem = this.getAttribute('payment-method-btn');
    localStorage.setItem('paymentMethod', `${paymentSystem}`);
  // КНОПКИ ОПЛАТЫ
    // if (paymentSystem === 'yandex') paymentBtn.textContent = `ЯНДЕКС.ДЕНЬГИ`;
    // else if (paymentSystem === 'paypal') paymentBtn.textContent = `ОПЛАТА С PAYPAL`;
  }

  function checkedContinuePay() {
    movePaymentStep = selectBtnPaymentMethod.every(current => current.hasAttribute('state'));

    if (movePaymentStep) {
      paymentBtn.setAttribute('state', 'enable');
      localStorage.setItem('completelyForm', 1);
      basketWrapper.setAttribute('state', 'initOrder');

      // НАЖАТЬ КНОПКУ CONTINUE (Состояние заполненности данных)
      basketBlockTwoComplete.classList.add('block__hidden');
      basketBlockTwo.classList.remove('block__hidden');
      basketAddressTitle.textContent = `МОЙ АДРЕС`;

      basketHelloName.style.display = 'block';
      basketHelloName.textContent = `Привет, ${JSON.parse(localStorage.contactsObj).name}`;
      navigationOrder.style.display = 'none';
    }
  }

  function checkedFinalSendOrder(event) { // Обработка платежа и отправка данных в БД
    event.preventDefault();

    let sendOrder = { // заказ
      'total': totalCost.textContent,
      'address': JSON.parse(localStorage.contactsObj).address,
      'delivery': localStorage.shipingMethodDesc
    };
    var sendGoods = JSON.parse(localStorage.goodsArray); // товары в заказе

    uploadOrdersToBD(sendOrder, sendGoods); // отправка на сервер данных о заказе
  }
}

function selectAndDeleteBagsGoods() { // выборка товаров в корзине
  axios({
    method: 'post',
    url: 'back/bags.php',
    data: `hash=${localStorage.getItem('hash')}&type=select`
  }).then((response) => {
    if (response.data != 'error') {
        response.data.forEach(el => basketDeleteData(el));
      localStorage.setItem('goodsArray', JSON.stringify([]));
      viewBasketPopup(false);
      updateCounerBasket();
    }
  });
}

function uploadOrdersToBD(order, goods) { /// отправка в базу данных \\\
  axios({
    method: 'post',
    url: 'back/orders.php',
    data: `type=insert&hash=${localStorage.getItem('hash')}&total=${order.total}&status=Получен&address=${order.address}&delivery=${order.delivery}&tracking=783565054360`
  }).then(function (response) {
    idOrder = response.data;
    if (response.data != 'error') {
      for( i = 0; i < goods.length; i++) {
        axios({
          method: 'post',
          url: 'back/goods.php',
          data: `type=insert&hash=${localStorage.getItem('hash')}&article=${goods[i].article}&name=${goods[i].name}&size=${goods[i].size}&number=${goods[i].number}&price=${goods[i].price}&img=${goods[i].img}&orders=${response.data}`
        })
      }
    }
  }).then((response) => sendOrderToOneC(idOrder, goods));
}

function sendOrderToOneC(id, goods) { // отправка данных в 1С–Битрикс
  let contactObj = JSON.parse(localStorage.getItem('contactsObj'));
  let str = '';

  goods.map((obj, index, arr) => {
    str = str + obj.sendid + '^^' + obj.number + '^^' + obj.size.replace(/^(.*?)\s.*$/, '$1') + `${index === arr.length - 1 ? '' : '**'}`;
  });

  axios({
      method: 'post',
      url: 'back/request.php',
      data: `hash=${localStorage.getItem('hash')}
      &name=${contactObj.name}
      &mail=${contactObj.mail}
      &phone=${contactObj.contact}
      &address=${contactObj.address}
      &comment=''
      &addressSdek=${contactObj.address}
      &delivery=${localStorage.shipingMetod}
      &shopData=${str}
      &deliveryPrice=''
      &pricePaid=0`
  }).then(function (response) {
    if (response.data != 'error') {
      selectAndDeleteBagsGoods();
      document.location.href = `/order#${id}`;
    }
  });
}



function checkedInputs(fields) { // Функция для проверки выбранных инпутов => fields
  fields.map(el => {
    if (el.value !== '') el.style.borderColor = '';
    else if (el.value === '') el.style.borderColor = 'red';
  });
}

function focusInputHandler() {
  this.style.borderColor = '';
}



/////// CDEK SEARCH IN POPUP\\\\\\\\\\\\\\\\\\\
let cdekPopup = document.querySelector('.cdek_popup');
if (cdekPopup) {
  let searchCdekPopup = cdekPopup.querySelector('[search-cdek="popup"]'),
      closeSearchBtn = cdekPopup.querySelector('[cdek-close-btn="popup"]'),
      cdekListDelivery = cdekPopup.querySelector('[cdek-list="popup"]'),
      cdekPopupCloseBtn = cdekPopup.querySelector('[cdek-close="popup"]'),
      cdekPopupOpenBtn = basketMainBlock.querySelector('[cdek-open="popup"]'),
      cdekMainBtn = basketMainBlock.querySelector('[shipping-method-btn="sdek"]'),
      errorMenu = cdekPopup.querySelector('[cdek-error="menu"]'),

      menuPointsDelivery = cdekPopup.querySelectorAll('.cdek__points-delivery'),
      formCdek = cdekPopup.querySelector('.cdek__form');

      searchCdekPopup.addEventListener('input', inputCdekHandler);
      closeSearchBtn.addEventListener('click', resetSearchValue);
      cdekPopupCloseBtn.addEventListener('click', viewCdekPopup);
      cdekPopupOpenBtn.addEventListener('click', viewCdekPopup);

let pointDeliveryFromNet = [ // Моковый массив, заместо этого будет запрос на сервер
  {'point' : 'На Нахимовском проспекте'},
  {'point' : 'На пролетарской'},
  {'point' : 'Волгоградский проспект'}];

// сбросить отправку формы
  formCdek.addEventListener('submit', event => {
    event.preventDefault();
    return false;
  });

  function viewCdekPopup() {
    if (this.getAttribute('cdek-close')) stateCdekPopup(false);
    else if (this.getAttribute('cdek-open')) stateCdekPopup(true);
  }

  function stateCdekPopup(state) {
    cdekPopup.style.display = state ? 'flex' : 'none';
    scrollControl(state ? 'lock' : 'unlock');
    cdekPopup[state ? 'addEventListener' : 'removeEventListener']('click', closeCdekPopup);
    document[state ? 'addEventListener' : 'removeEventListener']('keydown', closeCdekPopup);
  }

  function closeCdekPopup(evt) {
    if (evt.target === this || evt.keyCode === ESC_CODE) {
      cdekPopup.style.display = 'none';
      scrollControl('unlock');
    }
  }

  function choiceDestinationHandler() { // ВЫБОР ПУНКТА САМОВЫВОЗА
    cdekMainBtn.setAttribute('point-delivery', `${this.textContent}`);
    stateCdekPopup(false);
    resetSearchValue();
  }



// МОНИТОРИНГ ВВЕДЁННЫХ ДАННЫХ
  function inputCdekHandler(evt) {
    let valueCity = this.value;
    closeSearchBtn.style.display = valueCity ? 'block' : ''; // если пустое поле ввода – кнопка удаляется

    axiosDeliveryPoint();

    if (valueCity === '1') {
      viewPointsDelivery(true); // загрузка данных с сервера для последующего парсинга
      errorMenu.style.display = '';
    } else if (valueCity !== '') { // если ничего не найдено
      viewPointsDelivery(false);
      errorMenu.style.display = 'block';
    } else if (valueCity === '') { // если поле ввода пустое
      viewPointsDelivery(false);
      errorMenu.style.display = '';
    }
  }

  function resetSearchValue() {
    searchCdekPopup.value = '';
    closeSearchBtn.style.display = '';
    errorMenu.style.display = '';
    viewPointsDelivery(false); // загрузка данных с сервера для последующего парсинга
  }

  function viewPointsDelivery(view) {
    cdekListDelivery.style.display = view ? 'block' : '';
  }

  function axiosDeliveryPoint() {
    ///// ЗДЕСЬ БУДЕТ ЗАПРОС НА СЕРВЕР! pointDeliveryFromNet - MOK–овые данные \\\\\\
    renderDeliveryPoint(pointDeliveryFromNet);
  }

  function renderDeliveryPoint(data) {
    cdekListDelivery.innerHTML = '';
    pointDeliveryFromNet.map((el, index) => cdekListDelivery.appendChild(renderOneDeliveryPoint(el, index)));
  }

  function renderOneDeliveryPoint(element, i) {
    let template = document.getElementById('cdek-point-template').content,
        pointDelivery = template.cloneNode(true).querySelector('.cdek__delivery-item');

    pointDelivery.querySelector('.cdek__points-delivery').textContent = element.point;
    pointDelivery.addEventListener('click', choiceDestinationHandler);

    return pointDelivery;
  }
}



//////// АККОРДЕОН \\\\\\\
let acList = Array.from(document.querySelectorAll('*[acItem]')), // Все айтемы на странице
    accordionBlocks = Object.values(document.querySelectorAll('*[accordeon-group]')),
    acLinks = Array.from(document.querySelectorAll('*[links="faq"]')),
    acBlocks = Array.from(document.querySelectorAll('*[links-block="faq"]'));

if (acList.length > 0) {
  accordionBlocks.map(el => el.style.height = 0); // установка начального значения высоты (обязательно)
  acList.map(obj => obj.addEventListener('click', openAccordion));

  function openAccordion(evt) {
    // if (evt.target.getAttribute('acLink') || this.getAttribute('acLink')) return;
    this.classList.toggle('accordeon__item--active');

    let accordBlock = this.parentNode.querySelector('[accordeon-group]'); // элемент, которому задается высота
    if (accordBlock.style.height === "0px") {
      accordBlock.style.height = `${ accordBlock.scrollHeight }px`;
    } else {
        accordBlock.style.height = `${ accordBlock.scrollHeight }px`;
        window.getComputedStyle(accordBlock, null).getPropertyValue("height");
        accordBlock.style.height = "0";
    }

    accordBlock.addEventListener("transitionend", () => {
      if (accordBlock.style.height !== "0px") accordBlock.style.height = "auto";
    });
  }
}

if (acLinks.length > 0) {
  acLinks.map(el => el.addEventListener('click', linksNextAccordion));

  function linksNextAccordion() {
    acLinks.map(el => el.classList.remove('question_box_top_nav_itm_active'));
    this.classList.add('question_box_top_nav_itm_active');
    acBlocks.map(el => el.style.display = 'none');
    acBlocks[acLinks.indexOf(this)].style.display = 'block';
  }
}



// РЕДАКТИРОВАНИЕ ПРОФИЛЯ
let editProfileBtn = document.querySelector('[open-popup="edit-profile"]'),
    popups = Array.from(document.querySelectorAll('*[popup]')),
    saveProfileBtn = document.querySelector('[save-edit-btn="edit-profile"]'),//кнопка сохр-я данных
    profileFields = Array.from(document.querySelectorAll('*[person-popup]')),
    addressPerson = document.getElementById('address-person'),
    personDataFields = Array.from(document.querySelectorAll('*[person-data]')),
    completelyStateInput,
    errorPassword = document.querySelector('[error-password="error"]');

if (editProfileBtn) {
  editProfileBtn.addEventListener('click', window.openPopupBtn);
  editProfileBtn.addEventListener('click', inputPopupDataHandler);
}

if (saveProfileBtn) { // Редактирование данных пользователя
  saveProfileBtn.addEventListener('click', saveProfileHandler);

  profileFields.map(el => {
    el.addEventListener('focus', focusInputHandler); // обработчики на инпутах (фокус и заполнение)
    el.addEventListener('input', inputProfileHandler);
  });

  contactsObj = JSON.parse(localStorage.contactsObj);
}

// localStorage.contactsObj
if (localStorage.contactsObj && typeof JSON.parse(localStorage.contactsObj) === 'object') {
  inputCompleteData(personDataFields); // заполненные поля профиля
}

function closeKeyHandler(evt) {  // popupHandler for ESC
  if (evt.keyCode === ESC_CODE) {
    let closedPopup = this.querySelector('[statePopup="open"]');
    closePopup(closedPopup);
    document.removeEventListener('keydown', closeKeyHandler);
  }
}

function closeClickHandler(evt) {  // POPUPHANDLER for click
  if (this === evt.target || evt.target.hasAttribute('close-popup-btn')) {
    closePopup(this);
    this.removeEventListener('mousedown', closeClickHandler); // click
  }
}

function closePopup(popup) {  // Общая ф-ция для закрытия попапа
  scrollControl('unlock');
  popup.setAttribute('statePopup', 'close');
  popup.style.display = '';
  popup.style.height = '';
  if (profileFields) profileFields.map(el => el.style.borderColor = '');
}

function inputPopupDataHandler() { // заполн-е полей соответ-ми ключами из LS
  profileFields.forEach(el => {
    for (let key in contactsObj) {
      if (contactsObj.hasOwnProperty(key)) {
        if (el.getAttribute('person-popup') === key) el.value = contactsObj[key];
      }
    }
  });
}

function saveProfileHandler() { // сохранение данных пользователя
  let attrPopup = this.getAttribute('save-edit-btn'),
      popupClose = document.querySelector(`[popup="${attrPopup}"]`), passwordValue;

  contactsObj.address = addressPerson.value;

  if (!contactsObj.newPass) contactsObj.newPass = '';

  editAllProfileSend(contactsObj); // отправление запроса на сервер для сохранения изменений
  inputCompleteData(personDataFields);
  closePopup(popupClose);
}

function inputCompleteData(fields) {
  fields.forEach(el => {
    for (let key in contactsObj) {
      if (contactsObj.hasOwnProperty(key)) {
        if (el.getAttribute('person-data') === key) el.textContent = contactsObj[key];
      }
    }
  });
}

function inputProfileHandler() { // инпут ввёденых значений
  let target = this.getAttribute('person-popup'); // имя свойства
  contactsObj[`${target}`] = this.value; // наполнение объекта с контактами
}



if (mainMenu) { // Выпадающее меню + Авторизация
  var menuBtns = Array.from(mainMenu.querySelectorAll('*[btn-main-menu]')),
      catalogBtnHover = mainMenu.querySelector('[ev="menuhover"]'),
      catalogMenu = mainMenu.querySelector('[block-menu="catalog"]'),
      menuBlocks = Array.from(mainMenu.querySelectorAll('*[block-menu]')),
      menuWrapper = mainMenu.querySelector('[el="menu"]'),
      topMenuSilvashi = document.querySelector('.insert'),
      errorMessageLogin = Array.from(document.querySelectorAll('*[error-enter="message"]')),
      checkboxsMenuAuth = Array.from(document.querySelectorAll('*[checkbox="auth"]')),
      btnAutorization = Array.from(mainMenu.querySelectorAll('*[authorization-btn="login"]')),
      fieldsAuth = Array.from(mainMenu.querySelectorAll('*[field-auth]')),
      btnLogout = mainMenu.querySelector('[btn-login="logout"]');

//==
// HOVER MENU CATALOG
//==

let catalogTimer;

  menuBtns.map(el => el.addEventListener('click', stateMenu));
  catalogBtnHover.addEventListener('mouseenter', openCatalogMenu);

  function openCatalogMenu() {
    if (catalogTimer) clearTimeout(catalogTimer);
    openMenu(this);
    catalogBtnHover.addEventListener('mouseleave', setTimerForClose);

  // Обработчики открывающегося меню
    catalogMenu.addEventListener('mouseenter', resetMenuTimer);
    catalogMenu.addEventListener('mouseleave', setTimerForClose);
  }

  function resetMenuTimer() {
    clearTimeout(catalogTimer);
  }

  function setTimerForClose() {
    catalogTimer = setTimeout(closeCatalogMenu, 150);
  }

  function closeCatalogMenu() {
    closeMenu();
    catalogMenu.removeEventListener('mouseleave', setTimerForClose);
  }



// АВТОРИЗАЦИЯ В ОСНОВНОМ МЕНЮ
  btnLogout.addEventListener('click', logOutHandler);
  checkboxsMenuAuth.map(el => el.addEventListener('click', changeStateCheckbox));
  btnAutorization.map(el => el.addEventListener('click', checkedLoginFields));
  fieldsAuth.map(el => el.addEventListener('focus', resetFieldHandler));
  fieldsAuth.map(el => el.addEventListener('focus', () => errorMessageLogin[0].style.display = ''));

  function stateMenu() {
    if (this.getAttribute('ev') === 'menuclose') {
      closeMenu();
      menuWrapper.removeEventListener('click', closeOnClickMenu);
      document.removeEventListener('keydown', closeMenuHandler);
      catalogBtnHover.addEventListener('mouseenter', openCatalogMenu);
    } else {
      openMenu(this);
      menuWrapper.addEventListener('click', closeOnClickMenu);
      document.addEventListener('keydown', closeMenuHandler);
      catalogBtnHover.removeEventListener('mouseenter', openCatalogMenu);
      catalogBtnHover.removeEventListener('mouseleave', setTimerForClose);
    }
  }

  function openMenu(obj) { // obj - this
    scrollControl('lock');
    menuBtns[1].setAttribute('ev', 'menuclose');
    mainMenu.setAttribute('state', 'open');
    menuWrapper.setAttribute('main-menu', `${obj.getAttribute('block')}`);
    menuWrapper.style.height = `${window.innerHeight - mainMenu.offsetHeight}px`;
  }

  function closeOnClickMenu(evt) {
    if (this === evt.target) {
      closeMenu();
      menuWrapper.removeEventListener('click', closeOnClickMenu);
      catalogBtnHover.addEventListener('mouseenter', openCatalogMenu);
    }
  }

  function closeMenuHandler(evt) {
    if (evt.keyCode === ESC_CODE) {
      closeMenu();
      menuWrapper.removeEventListener('click', closeOnClickMenu);
      document.removeEventListener('keydown', closeMenuHandler);
      catalogBtnHover.addEventListener('mouseenter', openCatalogMenu);
    }
  }

  function closeMenu() {
    scrollControl('unlock');
    menuBtns[1].setAttribute('ev', 'menuopen');
    mainMenu.setAttribute('state', 'close');
    menuWrapper.setAttribute('main-menu', 'close');
    menuWrapper.style.height = '';
    errorMessageLogin.map(el => el.style.display = '');
    catalogMenu.removeEventListener('mouseleave', setTimerForClose);
  }

  function changeStateCheckbox() {
    let targetState = this.getAttribute('state');
    if (targetState === 'enable') this.setAttribute('state', 'disable');
    else if (targetState === 'disable') this.setAttribute('state', 'enable');
  }

  function checkedLoginFields() { // Проверка полей ЛОГИН + ПАРОЛЬ
    checkedAuthFields(fieldsAuth, errorMessageLogin[0]);
    let fillValues = fieldsAuth.every(el => el.value != '');
    sendLoginOnServer(fillValues, fieldsAuth, errorMessageLogin[0]);
  }

  function sendLoginOnServer(fill, fields, error, flagForPopup = false) { // авторизация
    if (fill) { // fill - аттрибут для проверки заполненности
      let loginField = fields[0], passwordField = fields[1];

      axios({
        method: 'post',
        url: 'back/login.php',
        data: `mail=${loginField.value}&pass=${passwordField.value}`
      }).then(async function (response) {
        if (response.data != 'error') {
          localStorage.setItem('hash', response.data);
          error.style.display = '';
          viewAutorizationUser(blockLogin, blockLogout, accountNames, profileBtns);
          await basketUploadData(undefined, true);
          if (flagForPopup) changeStatePopup('disable', mainAuthPopup); //ЗАКРЫТИЕ ПОПАПА АВТОРИЗАЦИИ ПРИ ЛОГИНЕ
        } else error.style.display = 'flex';
      });
    }
  }

  function checkedAuthFields(fields, error) {
    fields.map(el => {
      if (el.value === '') {
        el.setAttribute('valid', 'false');
        error.style.display = '';
      } else el.setAttribute('valid', 'true');
    });
  }

  function logOutHandler() {  // выход из аккаунта
    blockLogin.style.display = '';
    blockLogout.style.display = '';
    if (profileBtns) profileBtns.map(el => el.setAttribute('state', 'disable'));
    if (basketBtn) basketBtn.setAttribute('state', 'disable');

    localStorage.removeItem('hash');

    if (checkboxsMenuAuth[0].getAttribute('state') === 'disable' || checkboxsMenuAuth[1].getAttribute('state') === 'disable') fieldsAuth.map(el => el.value = '');
    if (document.location.pathname === '/person' || document.location.pathname === '/basket' || document.location.pathname === '/purchases' || document.location.pathname === '/order') document.location.href="/";
  }



// ОТКРЫТИЕ ПОПАПОВ ДЛЯ АВТОРИЗАЦИИ
  var mainPopup = document.querySelector('[popup="main-auth"]'),
      allAuthBtns = Array.from(document.querySelectorAll('*[account-btn]')),
      closeBtnAuth = Array.from(mainPopup.querySelectorAll('*[close-btn="auth"]')),
      resetPasswordBtn = mainPopup.querySelector('[btn-send-mail="password"]'),
      createAccountBtn = mainPopup.querySelector('[btn-create="account"]'),
      createAccountCheckbox = mainPopup.querySelector('[create-account="checkbox"]'),
      createAccountFields = Array.from(mainPopup.querySelectorAll('*[create-account="field"]')),
      resetMailField = mainPopup.querySelector('[reset-mail="field"]'),
      emailSendPopup = mainPopup.querySelector('[popup-part="email-send"]'),
      forgetPopup = mainPopup.querySelector('[popup-part="forget"]'),
      newPassPopup = mainPopup.querySelector('[popup-part="new-pass"]'),
      passwordChangePopup = mainPopup.querySelector('[popup-part="pass-change"]'),
      mainAuthPopup = mainPopup.querySelector('[popup-part="auth"]'),
      allPopup = Array.from(mainPopup.querySelectorAll('[popup-part]')),
      newPassChangeBtn = mainPopup.querySelector('[btn-reset-password="reset"]'),
      authPopupBtn = mainPopup.querySelector('[btn-open-popup="auth"]'),
      loginPopupBtn = mainPopup.querySelector('[authorization-btn="login"]'),
      fieldsAuthPopup = Array.from(mainPopup.querySelectorAll('*[field-auth]')),
      inputFieldNewPass = mainPopup.querySelector('[password="new"]'),
      regularExp = /^([a-z0-9_-]+\.)*[a-z0-9_-]+@[a-z0-9_-]+(\.[a-z0-9_-]+)*\.[a-z]{2,6}$/, // Регулярка для mail
      createAccountFlag, passwordEqual, PASSWORD_LENGTH = 7;

  allAuthBtns.map(el => el.addEventListener('click', popupAuthHandler));
  resetPasswordBtn.addEventListener('click', resetPasswordHandler);
  resetMailField.addEventListener('focus', resetFieldHandler);
  createAccountBtn.addEventListener('click', createAccountHandler);
  createAccountCheckbox.addEventListener('click', stateTermsCheckbox);
  createAccountFields.map(el => el.addEventListener('focus', resetAccInputHandler));
  inputFieldNewPass.addEventListener('focus', resetFieldHandler);
  loginPopupBtn.addEventListener('click', checkedAuthPopupFields);
  fieldsAuthPopup.map(el => el.addEventListener('focus', resetFieldHandler));
  fieldsAuthPopup.map(el => el.addEventListener('focus', () => errorMessageLogin[1].style.display = ''));

  function resetFieldHandler() {
    if (this.getAttribute('valid') !== 'true') this.setAttribute('valid', 'true');
  }

  function popupAuthHandler() {
    allPopup.map(el => el.setAttribute('state', 'disable'));
    let attr = this.getAttribute('account-btn');
    openAuthPopup(attr);
  }

  function openAuthPopup(param) {
    let specificPopup = mainPopup.querySelector(`[popup-part="${param}"]`);
    scrollControl('lock'); // Блок скролла – 10.01.2020
    changeStatePopup('enable', specificPopup);
    document.removeEventListener('keydown', closeMenuHandler); // предотвращает закрытие меню логина
    document.addEventListener('keydown', closePopupHandler);
    mainPopup.addEventListener('click', clickClosePopupAuth);
    closeBtnAuth.map(el => el.addEventListener('click', closePopupHandler));
  }

  function closePopupHandler(evt) {
    if (evt.keyCode === ESC_CODE || evt.target.getAttribute('close-btn')) {
      closeAuthPopup();
    }
  }

  function clickClosePopupAuth(event) {
    if (this === event.target) {
      closeAuthPopup();
    }
  }

  function closeAuthPopup() {
    allPopup.map(el => changeStatePopup('disable', el));
    resetMailField.value = '';
    createAccountFields.map(el => el.setAttribute('valid', 'true'));
    scrollControl('unlock'); // Блок скролла добавил 10.01.2020
    createAccountCheckbox.setAttribute('valid', 'true');
    document.addEventListener('keydown', closeMenuHandler);
    document.removeEventListener('keydown', closePopupHandler);
    mainPopup.removeEventListener('click', clickClosePopupAuth);
    closeBtnAuth.map(el => el.removeEventListener('click', closePopupHandler));
  }

  function changeStatePopup(param, popup) {
    mainPopup.setAttribute('state', param); // `${param}`
    popup.setAttribute('state', param);
  }

  function resetPasswordHandler() { // функция для перехода на попап уведомления о email
    // Проверка адреса
    if (resetMailField.value !== '' && resetMailField.value.match(regularExp)) {
      resetMailField.setAttribute('valid', 'true');

  // запрос на EMAIL для восстановления;
      axios({
        method: 'post',
        url: 'back/profile_recovery.php',
        data: `hash=${localStorage.getItem('hash')}&mail=${resetMailField.value}`
      });

      changeStatePopup('disable', forgetPopup);
      changeStatePopup('enable', emailSendPopup);
    } else if (resetMailField.value === '') {
      resetMailField.setAttribute('valid', 'false');
      forgetPopup.querySelector('.popup_form_input_invalid_txt').textContent = `Это обязательное поле`;
    } else if (!resetMailField.value.match(regularExp)) {
      resetMailField.setAttribute('valid', 'false');
      forgetPopup.querySelector('.popup_form_input_invalid_txt').textContent = `Введите корректный e–mail`;
    }
  }

  function recoveryProfile() { // функция для восстановления своего профиля
    let recoveryProfileElem = [];
    location.search.substr(1).split('&').map( (obj, index) => {
      recoveryProfileElem[index] = obj.split('=');
    });

    recoveryProfileElem.map( obj => {
      if (obj[0] == 'mlink') { //!localStorage.hash
        openAuthPopup(`new-pass`);
        newPassChangeBtn.addEventListener('click', checkNewPassword);
        document.addEventListener('keydown', setStartedLocation);
        mainPopup.addEventListener('click', setStartedLocation);
        logOutHandler(); // *выход из аккаунта при смене пароля
      }
    })
  }

  function setStartedLocation(evt) {  // сброс ссылки для пароля при закрытии попапа
    if (evt.keyCode === ESC_CODE || this === event.target || evt.target.getAttribute('close-btn')) {
      setLocation(document.location.origin);
      document.removeEventListener('keydown', setStartedLocation);
    }
  }

  recoveryProfile();



  function checkNewPassword(event) { // Создание нового пароля
    event.preventDefault();

    if (inputFieldNewPass.value.length >= PASSWORD_LENGTH) {
      inputFieldNewPass.setAttribute('valid', 'true');

      // ПОИСК ХЭША И запрос на изменение пароля
      let hash = location.href.slice(location.href.indexOf('=') + 1)
      axiosComparisonPassword(hash, inputFieldNewPass.value);

    } else if (inputFieldNewPass.value === '') {
      inputFieldNewPass.setAttribute('valid', 'false');
      newPassPopup.querySelector('.popup_form_input_invalid_txt').textContent = `Это обязательное поле`;
    } else if (inputFieldNewPass.value.length <= PASSWORD_LENGTH) {
      inputFieldNewPass.setAttribute('valid', 'false');
      newPassPopup.querySelector('.popup_form_input_invalid_txt').textContent = `Пароль должен быть больше ${PASSWORD_LENGTH} символов`;
    }
  }

  function axiosComparisonPassword(hash, newPass) { // Установка нового пароля в базе
    axios({
      method: 'post',
      url: 'back/profile_edit.php',
      data: `hash=${hash}&pass_recover=${newPass}`
    }).then(function (response) {
      if (response.data != 'error') {
        changeStatePopup('disable', newPassPopup);
        changeStatePopup('enable', passwordChangePopup);
        setLocation(`${document.location.origin}`);
        authPopupBtn.addEventListener('click', mainAuthHandler);
      } else {
        inputFieldNewPass.setAttribute('valid', 'false');
        newPassPopup.querySelector('.popup_form_input_invalid_txt').textContent = `Ссылка устарела`;
      }
    });
  }

  function mainAuthHandler() {  // авторизация через попап
    changeStatePopup('disable', passwordChangePopup);
    changeStatePopup('enable', mainAuthPopup);
    authPopupBtn.removeEventListener('click', mainAuthHandler);
  }

  function checkedAuthPopupFields() {
    checkedAuthFields(fieldsAuthPopup, errorMessageLogin[1]);
    let fillValues = fieldsAuthPopup.every(el => el.value != '');
    sendLoginOnServer(fillValues, fieldsAuthPopup, errorMessageLogin[1], this);
  }

  function setLocation(loc) {  // сброс пароля
    try {
      history.pushState(null, null, loc);
      return;
    } catch(e) {}
      location.hash = '#' + loc;
    }

  function createAccountHandler() {  //  СОЗДАНИЕ НОВОГО АККАУНТА
    let newObject = {}, correctMail;

    createAccountFields.map(el => {
      if (el.value === '') el.setAttribute('valid', 'false');
      else {
        el.setAttribute('valid', 'true');
        if (el.getAttribute('accountvalue')) newObject[`${el.getAttribute('accountvalue')}`] = el.value;
      }
    });

    if (createAccountFields[0].value.match(regularExp)) correctMail = true;
    else if (!createAccountFields[0].value.match(regularExp)) {
      correctMail = false;
      let popupRegistration = document.querySelector('[popup-part="registration"]');
      createAccountFields[0].setAttribute('valid', 'false');
      popupRegistration.querySelector('.popup_form_input_invalid_txt').textContent = `Введите корректный e–mail`;
    }

// Проверка паролей на совпадение
    if (createAccountFields[1].value === '' || createAccountFields[2].value === '') {
      createAccountFields[2].nextElementSibling.querySelector('.popup_form_input_invalid_txt').textContent = 'Это обязательное поле';
    } else if (createAccountFields[1].value != createAccountFields[2].value) {
      passwordEqual = false;
      createAccountFields[2].setAttribute('valid', 'false');
      createAccountFields[2].nextElementSibling.querySelector('.popup_form_input_invalid_txt').textContent = 'Пароли должны совпадать';
    } else if (createAccountFields[1].value === createAccountFields[2].value) {
      passwordEqual = true;
      createAccountFields[2].setAttribute('valid', 'true');
      createAccountFields[2].nextElementSibling.querySelector('.popup_form_input_invalid_txt').textContent = 'Это обязательное поле';
    }

    checkedCheckbox(createAccountCheckbox);
    createAccountFlag = createAccountFields.every(el => el.value != '');

  // ЗАПРОС НА СЕРВЕР ДЛЯ СОЗДАНИЯ АККАУНТА и послед-щий редиректа В ЛИЧНЫЙ КАБИНЕТ
    if (createAccountFlag && createAccountCheckbox.getAttribute('valid') === 'true' && passwordEqual && correctMail) {
      axios({
        method: 'post',
        url: 'back/reg.php',
        data: `mail=${newObject.mail}&pass=${newObject.password}&name=${newObject.name}&phone=${newObject.contact}`
      }).then( async (response) => {
        localStorage.setItem('hash', response.data);
        await basketUploadData(undefined, true);
        await setContactsObject();
        await redirectToPersonPage();
      });
    }
  }

  function redirectToPersonPage() {
    document.location.href="/person";
  }

  function checkedCheckbox(obj) {
    if (obj.getAttribute('state') === 'enable') obj.setAttribute('valid', 'true');
    else if (obj.getAttribute('state') === 'disable') obj.setAttribute('valid', 'false');
  }

  function stateTermsCheckbox() {
    if (this.getAttribute('state') === 'disable') {
      this.setAttribute('state', 'enable');
      if (this.getAttribute('valid') === 'false') this.setAttribute('valid', 'true');
    }
    else if (this.getAttribute('state') === 'enable') this.setAttribute('state', 'disable');
  }

  function resetAccInputHandler() {
    this.setAttribute('valid', 'true');
  }
}



// PADDIG MENU
let paddingMenu = document.querySelector('.menu_lay_catalog_block');
let countMenuItem = document.querySelector('[el="menuitem"]');

function addPaddingMenu() {
  if (window.matchMedia("(min-width: 1400px)").matches) {
    paddingMenu.style.paddingLeft = `${countMenuItem.getBoundingClientRect().x / 16 - 5}rem`;
  } else paddingMenu.style.paddingLeft = '';
}

if (paddingMenu && countMenuItem) {
  window.addEventListener('resize', addPaddingMenu);
  addPaddingMenu();
}

let viewCard = document.querySelector('.view');
if (viewCard) {
  let popupSizeGuide = viewCard.querySelector('[popup="size"]'),
      sizeGuideBtn = viewCard.querySelector('[card-size="popup"]');
      sizeGuideBtn.addEventListener('click', window.openPopupBtn);
}

window.script = {
  addGoodHandler, renderLocalStorageObj, wishlistUploadData
}

if (addressPerson) {
    ymaps.ready(init);

    function init() {
      var suggestView1 = new ymaps.SuggestView('address-person');
    }
}
