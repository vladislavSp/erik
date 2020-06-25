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

function resetValidation() {
  this.dataset.state = ``;
}

function checkBtnState() {
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

function textFieldValidation() {
  let value = this.value, numbers = [], initArr = [];

  numbers.push(value.replace(/[^\d]/g,'')); // находим значения цифр в инпуте
  initArr = value.split(''); // разделяем ввод на массив (",");

  let num = initArr.indexOf(numbers[0]); // поиск первого ввода цифры

  if (num >= 0) {
    initArr.splice(num, 1); // удаление этого ввода
    this.value = initArr.join(''); // подстановка значения без цифр
  }

  if (this.value === ` `) this.value = this.value.trim(); //удаление первого пробела

  if (this.value.length > 0) this.dataset.valid = `valid`;
  else if (this.value === ``) this.dataset.valid = ``;
}

function numberValidation() {
  this.value = this.value.replace(/[^\d.]/g, '');
  if (this.value !== ``) this.dataset.valid = `valid`;
  else this.dataset.valid = ``;
}

function mailValidation () {
  let mailExp = /\S+@\S+\.\S+/;
  if (this.value.match(mailExp)) this.dataset.valid = `valid`;
  else if (this.value === ``) this.dataset.valid = ``;
  else this.dataset.valid = `invalid`;
}

function addressValidation() {
  if (this.value.length > 0) {
    this.dataset.valid = `valid`;
    deliveryCost.setAttribute(`data-basket-delivery`, 850);
    createTotalCost(850);
  }
  else if (this.value.length === 0) {
    this.dataset.valid = ``;
    deliveryCost.setAttribute(`data-basket-delivery`, ``);
    createTotalCost();
  }
}



// CHECKBOX
function checkboxClickHandler() {
  this.dataset.state = this.dataset.state === `check` ? `` : `check`;
  this.dataset.valid = this.dataset.state === `check` ? `valid` : ``;
  checkBtnState();
}

function checkValidation() {
  inputFields.forEach(el => {
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
