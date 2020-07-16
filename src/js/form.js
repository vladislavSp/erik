import createTotalCost from './basket.js';

let checkboxWrap = document.querySelector(`[data-order-check]`),
    inputFields = [...document.querySelectorAll(`*[data-order-field]`)],
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

function checkBtnState() { // проверка заполненности формы
  let fieldComplete = inputFields.every(el => el.dataset.valid === `valid`);
  let checkboxCheck = checkboxWrap.dataset.state === `check`;

  orderBtn.dataset.state = fieldComplete && checkboxCheck ? `order` : ``;
}



// VALIDATION
function validationHandler(elem) {
  let value = elem.dataset.validation;

  if (value === `text`) elem.addEventListener(`input`, textFieldValidation);
  else if (value === `number`) elem.addEventListener(`input`, numberValidation);
  else if (value === `mail`) elem.addEventListener(`input`, mailValidation);
  else if (value === `address`) elem.addEventListener(`input`, addressValidation);
}

function textFieldValidation(event) {
  let el = event.target ? event.target : event ;
  let value = el.value, numbers = [], initArr = [];

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
  if (el.value !== ``) el.dataset.valid = `valid`;
  else el.dataset.valid = ``;
}

function mailValidation (event) {
  let el = event.target ? event.target : event;
  let mailExp = /\S+@\S+\.\S+/;

  if (el.value.match(mailExp)) el.dataset.valid = `valid`;
  else if (el.value === ``) el.dataset.valid = ``;
  else el.dataset.valid = `invalid`;
}

function addressValidation(event) { // ввод в форму значений и получение цены
  let el = event.target ? event.target : event;

  if (el.value.length > 0) { // Пересмотреть условие, чтобы добавить проверку адреса и определение цены
    // ЗАПИСЬ В МОМЕНТ ПОЛУЧЕНИЯ ДАННЫХ
    el.dataset.valid = `valid`;
    deliveryCost.setAttribute(`data-basket-delivery`, 850); 
    createTotalCost(850);
  }
  else if (el.value.length === 0) {
    el.dataset.valid = ``;
    deliveryCost.setAttribute(`data-basket-delivery`, ``);
    createTotalCost();
  }
}



// CHECKBOX VALID
function checkboxClickHandler() {
  this.dataset.state = this.dataset.state === `check` ? `` : `check`;
  this.dataset.valid = this.dataset.state === `check` ? `valid` : ``;
  checkBtnState();
}

function checkValidation() {
  inputFields.forEach((el, i, arr) => {
    if (el.getAttribute('data-validation') === `text`) textFieldValidation(el); // ДОБАВИТЬ ПРОВЕРКУ ДЛЯ ПОЛЕЙ 
    else if (el.getAttribute('data-validation') === `number`) numberValidation(el);
    else if (el.getAttribute('data-validation') === `mail`) mailValidation(el);
    else if (el.getAttribute('data-validation') === `address`) addressValidation(el);

    if (el.dataset.valid !== `valid`) el.setAttribute(`data-state`, `invalid`);
  });
  

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
  }).then(function (response) {
    location.href = response.data.link;
  });
}



// ymaps.ready(init);
// function init() {
//   ymaps.geocode(`Поле поиска`, {

//   }).then((res) => {
//     var firstGeoObject = res.geoObjects.get(0);
//     console.log(firstGeoObject);
//     console.log(`Все данные объекта: `, firstGeoObject.properties.getAll());
//   });
// }
