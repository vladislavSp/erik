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
//     // Подключаем поисковые подсказки к полю ввода.
//     var suggestView = new ymaps.SuggestView('suggest'),
//         map,
//         placemark;

//     // При клике по кнопке запускаем верификацию введёных данных.
//     $('#button').bind('click', function (e) {
//         geocode();
//     });

//     function geocode() {
//         // Забираем запрос из поля ввода.
//         var request = $('#suggest').val();
//         // Геокодируем введённые данные.
//         ymaps.geocode(request).then(function (res) {
//             var obj = res.geoObjects.get(0),
//                 error, hint;

//             if (obj) {
//                 // Об оценке точности ответа геокодера можно прочитать тут: https://tech.yandex.ru/maps/doc/geocoder/desc/reference/precision-docpage/
//                 switch (obj.properties.get('metaDataProperty.GeocoderMetaData.precision')) {
//                     case 'exact':
//                         break;
//                     case 'number':
//                     case 'near':
//                     case 'range':
//                         error = 'Неточный адрес, требуется уточнение';
//                         hint = 'Уточните номер дома';
//                         break;
//                     case 'street':
//                         error = 'Неполный адрес, требуется уточнение';
//                         hint = 'Уточните номер дома';
//                         break;
//                     case 'other':
//                     default:
//                         error = 'Неточный адрес, требуется уточнение';
//                         hint = 'Уточните адрес';
//                 }
//             } else {
//                 error = 'Адрес не найден';
//                 hint = 'Уточните адрес';
//             }

//             // Если геокодер возвращает пустой массив или неточный результат, то показываем ошибку.
//             if (error) {
//                 showError(error);
//                 showMessage(hint);
//             } else {
//                 showResult(obj);
//             }
//         }, function (e) {
//             console.log(e)
//         })

//     }
//     function showResult(obj) {
//         // Удаляем сообщение об ошибке, если найденный адрес совпадает с поисковым запросом.
//         $('#suggest').removeClass('input_error');
//         $('#notice').css('display', 'none');

//         var mapContainer = $('#map'),
//             bounds = obj.properties.get('boundedBy'),
//         // Рассчитываем видимую область для текущего положения пользователя.
//             mapState = ymaps.util.bounds.getCenterAndZoom(
//                 bounds,
//                 [mapContainer.width(), mapContainer.height()]
//             ),
//         // Сохраняем полный адрес для сообщения под картой.
//             address = [obj.getCountry(), obj.getAddressLine()].join(', '),
//         // Сохраняем укороченный адрес для подписи метки.
//             shortAddress = [obj.getThoroughfare(), obj.getPremiseNumber(), obj.getPremise()].join(' ');
//         // Убираем контролы с карты.
//         mapState.controls = [];
//         // Создаём карту.
//         createMap(mapState, shortAddress);
//         // Выводим сообщение под картой.
//         showMessage(address);
//     }

//     function showError(message) {
//         $('#notice').text(message);
//         $('#suggest').addClass('input_error');
//         $('#notice').css('display', 'block');
//         // Удаляем карту.
//         if (map) {
//             map.destroy();
//             map = null;
//         }
//     }

//     function createMap(state, caption) {
//         // Если карта еще не была создана, то создадим ее и добавим метку с адресом.
//         if (!map) {
//             map = new ymaps.Map('map', state);
//             placemark = new ymaps.Placemark(
//                 map.getCenter(), {
//                     iconCaption: caption,
//                     balloonContent: caption
//                 }, {
//                     preset: 'islands#redDotIconWithCaption'
//                 });
//             map.geoObjects.add(placemark);
//             // Если карта есть, то выставляем новый центр карты и меняем данные и позицию метки в соответствии с найденным адресом.
//         } else {
//             map.setCenter(state.center, state.zoom);
//             placemark.geometry.setCoordinates(state.center);
//             placemark.properties.set({iconCaption: caption, balloonContent: caption});
//         }
//     }

//     function showMessage(message) {
//         $('#messageHeader').text('Данные получены:');
//         $('#message').text(message);
//     }
// }
