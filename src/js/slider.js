let collCont = document.querySelector('.collection__cont'),
    goodCont = document.querySelector('.card__container');

if (collCont) {
  let colSlider = new Swiper(collCont, {
    wrapperClass: 'collection__wrap',
    slideClass: 'collection__item',
    slidesPerView: 1,
    speed: 600,
    spaceBetween: 12,

    navigation: {
      nextEl: '.controls__btn[data-control-col="right"]',
      prevEl: '.controls__btn[data-control-col="left"]',
      disabledClass: 'controls__btn--disabled',
    },
  });
}

if (goodCont && window.matchMedia("(max-width: 991px)").matches) {
  let goodCSlider = new Swiper(goodCont, {
    wrapperClass: 'card__wrapper',
    slideClass: 'card__item',
    slidesPerView: 'auto',
    speed: 600,
  });
}

let controls = document.querySelector('.controls'),
    textWrap = document.querySelector('.collection__text');
if (controls && textWrap) controls.style.bottom = `${textWrap.getBoundingClientRect().height}px`;
