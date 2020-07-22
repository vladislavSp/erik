let btnsScroll = [...document.querySelectorAll(`*[data-link="scroll"]`)],
    headerBlock = document.querySelector(`[data-header]`),
    blocksForSroll = [...document.querySelectorAll(`[data-content]`)];

if (btnsScroll.length && blocksForSroll.length) {
  btnsScroll.forEach(el => el.addEventListener('click', scrollToContent));
}

function scrollToContent(evt) {
  let attr = this.getAttribute('href').split(`#`)[1];
  if (attr) {
    if (location.pathname === '/') evt.preventDefault();

    blocksForSroll.forEach(el => {
      if (el.getAttribute(`data-content`) === attr) {
        gsap.to(document.querySelector('html'), 0.8, {
          ease: Power2.easeOut,
          scrollTop: el.getBoundingClientRect().top + pageYOffset - headerBlock.getBoundingClientRect().height
        });
      }
    });
  }
}