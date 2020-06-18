let checkboxWrap = document.querySelector(`[data-order-check]`),
    inputFields = [...document.querySelectorAll(`*[data-order-field]`)];

if (inputFields.length) {
  inputFields.forEach(el => el.addEventListener(`focus`, resetInvalid));
  inputFields.forEach(el => validationHandler(el));
}
if (checkboxWrap) checkboxWrap.addEventListener(`click`, checkboxClickHandler);



// VALIDATION
function validationHandler(elem) {
  if (elem.getAttribute(`data-validation`) === `text`) elem.addEventListener(`input`, textFieldValidation);
  else if (elem.getAttribute(`data-validation`) === `phone`) elem.addEventListener(`input`, phoneValidation);
  else if (elem.getAttribute(`data-validation`) === `mail`) elem.addEventListener(`input`, mailValidation);
  else if (elem.getAttribute(`data-validation`) === `index`) elem.addEventListener(`input`, indexValidation);
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
}

function phoneValidation() {
  this.value = this.value.replace(/[^\d.]/g, '');
}

function mailValidation () {
  let mailExp = /\S+@\S+\.\S+/;
  if (this.value.match(mailExp)) this.dataset.state = `valid`;
  else this.dataset.state = `invalid`;
}

function indexValidation () {
  console.log(this);
}

// RESET INPUT ON FOCUS
function resetInvalid() {
  if (this.dataset.state === `invalid`) this.dataset.state = ``;
}


// CHECKBOX
function checkboxClickHandler() {
  this.dataset.state = this.dataset.state === `check` ? `` : `check`;
}

// ymaps.ready(init);

// function init() {
//     // Создаем выпадающую панель с поисковыми подсказками и прикрепляем ее к HTML-элементу по его id.
//     var suggestView1 = new ymaps.SuggestView('suggest1');
//     // Задаем собственный провайдер поисковых подсказок и максимальное количество результатов.
//     var suggestView2 = new ymaps.SuggestView('suggest2', {provider: provider, results: 3});
// }
