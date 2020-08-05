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

function resetValidation() {
  this.dataset.state = ``;
}


function checkBtnState() { // check form fields
  let fieldComplete = inputFields.every(el => el.dataset.valid === `valid`);
  let checkboxCheck = checkboxWrap.dataset.state === `check`;

  orderBtn.dataset.state = fieldComplete && checkboxCheck ? `order` : ``;
}


// validation functions
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
  numbers.push(value.replace(/[^\d]/g,''));
  initArr = value.split('');

  let num = initArr.indexOf(numbers[0]);

  if (num >= 0) {
    initArr.splice(num, 1);
    el.value = initArr.join('');
  }

  if (el.value === ` `) el.value = this.value.trim();

  if (el.value.length > 0) el.dataset.valid = `valid`;
  else if (el.value === ``) el.dataset.valid = ``;
}

function numberValidation(event) {
  let el = event.target ? event.target : event;
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

function addressValidation(event) {
  let el = event.target ? event.target : event;
  el.setAttribute('value', el.value);

  if (el.value.length > 0) {
    el.dataset.valid = `valid`;
  } else if (el.value.length === 0) {
    el.dataset.valid = ``;
  }
}

// if (inputIndexField && inputIndexField.getAttribute('value')) indexValidation(inputIndexField);

function indexValidation(event) {
  let el = event.target ? event.target : event;
  el.setAttribute('value', el.value);

  if (el.value.length > 4) el.dataset.valid = `valid`;
  else el.dataset.valid = ``;
}


//
function checkboxClickHandler() {
  this.dataset.state = this.dataset.state === `check` ? `` : `check`;
  this.dataset.valid = this.dataset.state === `check` ? `valid` : ``;

  checkFields();
  checkBtnState();
}


function checkFields() {
  inputFields.forEach(el => {
    if (el.getAttribute('data-validation') === `text`) textFieldValidation(el);
    else if (el.getAttribute('data-validation') === `number`) numberValidation(el);
    else if (el.getAttribute('data-validation') === `mail`) mailValidation(el);
    else if (el.getAttribute('data-validation') === `address`) addressValidation(el);
    else if (el.getAttribute('data-validation') === `index`) indexValidation(el);

    if (el.dataset.valid !== `valid`) el.setAttribute(`data-state`, `invalid`);
  });
}

function checkValidation() {
  checkFields();
  indexValidation(inputIndexField);

  let fieldComplete = inputFields.every(el => el.dataset.valid === `valid`);
  let checkboxCheck = checkboxWrap.dataset.state === `check`;
  
  if (!checkboxCheck) checkboxWrap.dataset.valid = `invalid`;

  if (fieldComplete && checkboxCheck) { // check click btn
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
    if (response.data === `error`) location.href = location.href;
    else if (typeof response.data === `object`) {
      localStorage.goods = JSON.stringify([]); // delete state basket after purchase
      location.href = response.data.link;
    }
  });
}