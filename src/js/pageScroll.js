let btnsScroll = [...document.querySelectorAll(`*[data-link="scroll"]`)],
    blocksForSroll = [...document.querySelectorAll(`[data-content]`)];

if (btnsScroll.length && blocksForSroll.length) {
  btnsScroll.forEach(el => el.addEventListener('click', scrollToContent));
}

function scrollToContent(evt) {
  let attr = this.getAttribute('href').split(`#`)[1];
  if (attr) {
    evt.preventDefault();

    blocksForSroll.forEach(el => {
      if (el.getAttribute(`data-content`) === attr) {
        gsap.to($("body,html"), 0.8, {
          ease: Power2.easeOut,
          scrollTop: el.getBoundingClientRect().top + pageYOffset
        });
      }
    });
  }
}