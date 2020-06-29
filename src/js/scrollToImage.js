let containerCard = document.querySelector(`[data-card="navwrap"]`);

class ViewProgress{
    
  /**
   * Variable data
  */
  constructor(){
      // wrapper view
      this.vwrap = document.querySelector('*[data-card="view"]'),
      // card view
      this.vcard = this.vwrap.querySelectorAll('*[data-card]'),
      // wrapper navigation
      this.nwrap = document.querySelector('*[data-card="navwrap"]'),
      // card navigation
      this.ncard = this.nwrap.querySelectorAll('*[data-card]');
  }

  /**
   * Init
  */
  init(){
      // scroll state navigation element
      window.addEventListener('scroll', this.scroll.bind(this));
      // click navigation element
      [...this.ncard].map(obj => {
          obj.addEventListener('click', this.jump.bind(this));
      });
  }

  /**
   * Sroll logic
  */
  scroll(){
      // calculation position
      let elem = this.cord( this.vcard );
      // select position
      elem.sort(function(a, b){
          return a.cord-b.cord;
      });
      // select id element
      let result = elem[0].obj.getAttribute('data-card');
      // state element navigation
      this.state(result);
  }

  /**
   * Calculation position
  */
  cord(data){
      // result
      let el = [];
      // calculation
      [...data].map( obj => {
          // detected size
          let top = obj.getBoundingClientRect().top,
              height = obj.getBoundingClientRect().height/2,
              screen = innerHeight/2;
          // calculation size
          let cord = top + height - screen;
          // trasform size
          cord < 0 ? cord *= -1 : ''; 
          // push result
          el.push({'obj': obj, 'cord': cord});
      });
      // return result
      return el;
  }

  /**
   * State navigation element
  */
  state(data){
      // select element navigation    
      let el = this.nwrap.querySelector(`*[data-card='${data}']`);
      // disable all element
      [...this.ncard].map(obj => {
          obj.setAttribute('state', 'disable');
      });
      // enable select element
      el.setAttribute('state', 'enable');
      // console.log(el);
  }

  /**
   * Scroll to element
  */
  jump(){
      // num event
      let num = event.target.getAttribute('data-sa');
      // cord scroll element
      let el = this.vwrap.querySelector(`*[data-sb='${num}']`);
      // cord
      let size = el.getBoundingClientRect().top + pageYOffset;
      // animation scroll
      gsap.to( $('body,html'), 0.8, {ease: Power2.easeOut, scrollTop: size} );
  }
}

if (containerCard) {
  let viewProgress = new ViewProgress;
  viewProgress.init();
}
