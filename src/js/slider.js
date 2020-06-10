let collCont = document.querySelector('.collection__cont'),
    goodCont = document.querySelector('.card__container');

if (collCont) {
  let colSlider = new Swiper(collCont, {
    wrapperClass: 'collection__wrap',
    slideClass: 'collection__item',
    slidesPerView: 'auto',
    speed: 600,

    navigation: {
      nextEl: '.contols__btn[data-control-col="right"]',
      prevEl: '.contols__btn[data-control-col="left"]',
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
