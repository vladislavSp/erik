let cardNav = document.querySelector('[data-card]');

if (cardNav && window.matchMedia("(min-width: 992px)").matches) view_progress();

function view_progress() {

  window.addEventListener('scroll', progress_view_scroll);
  window.addEventListener('load', progress_view_scroll);

  let headerCard = document.querySelector('[data-header="close"]');
  let progress_view_wrap = document.querySelector('*[data-card="view"]'),
      progress_view_obj = Object.values(progress_view_wrap.querySelectorAll('*[data-card]')),
      progress_view_nav_wrapper = document.querySelector('*[data-card="navwrap"]'),
      progress_view_nav = Object.values(progress_view_nav_wrapper.querySelectorAll('*[data-card]'));

  let progress_view_num = '';

  function progress_view_scroll() {
    progress_view_obj.map( obj => {
      let progress_view_top = obj.getBoundingClientRect().top,
      progress_view_bottom = obj.getBoundingClientRect().bottom;
      if (progress_view_top - 4 <= 0 && progress_view_bottom - 4 >= 0) {
        if (progress_view_num != obj.getAttribute('data-card')) {
          progress_view_num = obj.getAttribute('data-card');
          progress_view_nav.map( obj => {
              obj.setAttribute('state', 'disable');
          });
          progress_view_nav[progress_view_num - 1].setAttribute('state', 'enable');
        }
      }
    });
  }

  progress_view_nav.map(obj => {
    obj.addEventListener('click', function(){
      let progressViewNavSize = progress_view_wrap.querySelector(`[data-card][data-sb="${this.getAttribute('data-sa')}"]`).getBoundingClientRect().top + pageYOffset;

      gsap.to($('body,html'), 0.8,
      {ease: Power2.easeOut, scrollTop: progressViewNavSize - headerCard.getBoundingClientRect().height});
    })
  })
}


