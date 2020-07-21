import createTotalCost from './basket.js';

let checkboxWrap = document.querySelector(`[data-order-check]`),
    inputFields = [...document.querySelectorAll(`*[data-order-field]`)],
    inputIndexField = document.querySelector('[data-order-field="index"]'),
    deliveryCost = document.querySelector(`[data-basket-delivery]`),
    orderBtn = document.querySelector(`[data-send-order]`);

if (inputFields.length) {
  inputFields.forEach(el => {
    validationHandler(el);
    el.addEventListener(`input`, checkBtnState);
    el.addEventListener(`focus`, resetValidation);
  });
}

if (checkboxWrap) checkboxWrap.addEventListener(`click`, checkboxClickHandler);

if (orderBtn) orderBtn.addEventListener(`click`, checkValidation);

function resetValidation() { // сброс ошибок инпутов
  this.dataset.state = ``;
}


function checkBtnState() { // проверка заполненности формы и 
  let fieldComplete = inputFields.every(el => el.dataset.valid === `valid`);
  let checkboxCheck = checkboxWrap.dataset.state === `check`;

  orderBtn.dataset.state = fieldComplete && checkboxCheck ? `order` : ``;
}


// Обработчики для вода значений
function validationHandler(elem) {
  let value = elem.dataset.validation; // get data-validation

  if (value === `text`) elem.addEventListener(`input`, textFieldValidation);
  else if (value === `number`) elem.addEventListener(`input`, numberValidation);
  else if (value === `mail`) elem.addEventListener(`input`, mailValidation);
  else if (value === `address`) elem.addEventListener(`input`, addressValidation);
  else if (value === `index`) elem.addEventListener(`input`, indexValidation);
}

function textFieldValidation(event) {
  let el = event.target ? event.target : event ;
  let value = el.value, numbers = [], initArr = [];
  el.setAttribute('value', el.value);
  numbers.push(value.replace(/[^\d]/g,'')); // находим значения цифр в инпуте
  initArr = value.split(''); // разделяем ввод на массив (",");

  let num = initArr.indexOf(numbers[0]); // поиск первого ввода цифры

  if (num >= 0) {
    initArr.splice(num, 1); // удаление этого ввода
    el.value = initArr.join(''); // подстановка значения без цифр
  }

  if (el.value === ` `) el.value = this.value.trim(); //удаление первого пробела

  if (el.value.length > 0) el.dataset.valid = `valid`;
  else if (el.value === ``) el.dataset.valid = ``;
}

function numberValidation(event) {
  let el = event.target ? event.target : event; // выбор эвента для
  el.value = el.value.replace(/[^\d.]/g, '');
  el.setAttribute('value', el.value);
  if (el.value !== ``) el.dataset.valid = `valid`;
  else el.dataset.valid = ``;
}

function mailValidation (event) {
  let el = event.target ? event.target : event;
  let mailExp = /\S+@\S+\.\S+/;
  el.setAttribute('value', el.value);

  if (el.value.match(mailExp)) el.dataset.valid = `valid`;
  else if (el.value === ``) el.dataset.valid = ``;
  else el.dataset.valid = `invalid`;
}

function addressValidation(event) { // ввод в форму значений и получение цены
  let el = event.target ? event.target : event;
  el.setAttribute('value', el.value);

  if (el.value.length > 0) { // Пересмотреть условие, чтобы добавить проверку адреса и определение цены
    el.dataset.valid = `valid`;
  } else if (el.value.length === 0) {
    el.dataset.valid = ``;
  }
}

if (inputIndexField && inputIndexField.getAttribute('value')) indexValidation(inputIndexField); // если поле ввода

function indexValidation(event) {
  let el = event.target ? event.target : event;
  el.setAttribute('value', el.value);

  if (el.value.length > 0) { // проверка 
    sendRequest(el);
  } else {
    el.dataset.valid = ``;
    el.dataset.state = ``;
    deliveryCost.setAttribute(`data-basket-delivery`, ``);
    createTotalCost();
  }
}


// Проверка checkbox (а внутри полей формы и кнопки)
function checkboxClickHandler() {
  this.dataset.state = this.dataset.state === `check` ? `` : `check`;
  this.dataset.valid = this.dataset.state === `check` ? `valid` : ``;

  checkFields();
  checkBtnState();
  indexValidation(inputIndexField);
}

// Проверка полей - за искл индекса
function checkFields() {
  inputFields.forEach(el => {
    if (el.getAttribute('data-validation') === `text`) textFieldValidation(el); // ДОБАВИТЬ ПРОВЕРКУ ДЛЯ ПОЛЕЙ 
    else if (el.getAttribute('data-validation') === `number`) numberValidation(el);
    else if (el.getAttribute('data-validation') === `mail`) mailValidation(el);
    else if (el.getAttribute('data-validation') === `address`) addressValidation(el);
    // else if (el.getAttribute('data-validation') === `index`) indexValidation(el);

    if (el.dataset.valid !== `valid`) el.setAttribute(`data-state`, `invalid`);
  });
}

function checkValidation() {
  checkFields();
  indexValidation(inputIndexField);

  let fieldComplete = inputFields.every(el => el.dataset.valid === `valid`);
  let checkboxCheck = checkboxWrap.dataset.state === `check`;
  
  if (!checkboxCheck) checkboxWrap.dataset.valid = `invalid`;

  if (fieldComplete && checkboxCheck) { // проверка события на кнопке
    if (this.hasAttribute('data-send-order')) sendingForm();
  }
}

function sendingForm() {
  let sendObj = {}, sendJson, data = {};

  inputFields.forEach(el => sendObj[el.getAttribute(`data-order-field`)] = el.value);

  sendObj.goods = JSON.parse(localStorage.goods);

  data.name = `${sendObj.name} ${sendObj.secname}`;
  data.phone = sendObj.phone;
  data.mail = sendObj.mail;
  data.country = sendObj.country;
  data.city = sendObj.city;
  data.address = sendObj.address;
  data.indexx = sendObj.index;
  data.goods = [];

  sendObj.goods.forEach(el => {
    data.goods.push({id: el.id, num: el.number});
  });

  sendJson = JSON.stringify(data);

  axios({
    method: 'post',
    url: `back/state.php`,
    data: `api=add&data=${sendJson}`,
  }).then((response) => {
    if (response.data) localStorage.goods = JSON.stringify([]); // Очищение корзины после покупки
  }).then((response) => {
    if (response.data) location.href = response.data.link;
  });
}

function sendRequest(element) { // ЗАПРОС ЦЕНЫ - element - это index
  let sendObj = {}, sendJson, data = {};
  data.goods = [];

  sendObj.goods = JSON.parse(localStorage.goods);
  sendObj.goods.forEach(el => data.goods.push({id: el.id, num: el.number}));

  data.indexx = element.value;
  sendJson = JSON.stringify(data);

  // if (!deliveryCost.getAttribute('data-basket-delivery')) 
  if (localStorage.getItem('lang') === 'en') deliveryCost.textContent = `Determined`;
  else deliveryCost.textContent = `Определяется`;

  axios({
    method: 'post',
    url: `back/state.php`,
    data: `api=price&data=${sendJson}`,
  }).then(function (response) {
    if (response.data.delivery === `error`) { // Ошибка ввода - ввести корректный индекс
      element.dataset.state = `invalid`;
      element.dataset.valid = ``;

      deliveryCost.setAttribute(`data-basket-delivery`, ``);
      createTotalCost();
      if (localStorage.getItem('lang') === 'en') deliveryCost.textContent = `Enter correct index`;
      else deliveryCost.textContent = `Введите корректный индекс`;
    } else {
      element.dataset.state = ``;
      element.dataset.valid = `valid`;

      let price = response.data.delivery.price;

      deliveryCost.setAttribute(`data-basket-delivery`, price); 
      createTotalCost(price);
    }
  }).then(() => {
    checkFields();
    checkBtnState();
  });
}

export default sendRequest;