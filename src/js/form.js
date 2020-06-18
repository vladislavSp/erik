let checkboxWrap = document.querySelector(`[data-order-check]`),
    inputFields = [...document.querySelectorAll(`*[data-order-field]`)],
    orderBtn = document.querySelector(`[data-send-order]`);

if (inputFields.length) {
  inputFields.forEach(el => {
    validationHandler(el);
    el.addEventListener(`input`, checkValidation);
  });
}
if (checkboxWrap) checkboxWrap.addEventListener(`click`, checkboxClickHandler);



// VALIDATION
function validationHandler(elem) {
  let value = elem.dataset.validation;

  if (value === `text`) elem.addEventListener(`input`, textFieldValidation);
  else if (value === `number`) elem.addEventListener(`input`, numberValidation);
  else if (value === `mail`) elem.addEventListener(`input`, mailValidation);
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

  if (this.value.length > 0) this.dataset.state = `valid`;
  else if (this.value === ``) this.dataset.state = ``;
}

function numberValidation() {
  this.value = this.value.replace(/[^\d.]/g, '');
  if (this.value !== ``) this.dataset.state = `valid`;
  else this.dataset.state = ``;
}

function mailValidation () {
  let mailExp = /\S+@\S+\.\S+/;
  if (this.value.match(mailExp)) this.dataset.state = `valid`;
  else if (this.value === ``) this.dataset.state = ``;
  else this.dataset.state = `invalid`;
}



// CHECKBOX
function checkboxClickHandler() {
  this.dataset.state = this.dataset.state === `check` ? `` : `check`;
  checkValidation();
}

function checkValidation() {
  let fieldComplete = inputFields.every(el => el.dataset.state === `valid`);
  let checkboxCheck = checkboxWrap.dataset.state === `check`;
  
  if (fieldComplete && checkboxCheck) {
    console.log(`Пройдено`);
    orderBtn.dataset.state = `order`;
  } else {
    console.log(`Не пройдено`);
    
    orderBtn.dataset.state = ``;
  }
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
