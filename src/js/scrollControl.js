export default class ScrollControl {
    /*
    * Lock Scroll
    */
    static lock(param) {
        this._elem = document.querySelector('body');
        // width scroll bar
        document.querySelector('body').innerWidth - document.querySelector('body').clientWidth
        // this.size = this._elem.innerWidth - this._elem.clientWidth;
        // console.log(this._elem.clientWidth);
        // overflow hidden
        this._elem.style.overflow = 'hidden';
        // state
        this._elem.setAttribute('scrollControlState', 'lock');
        // add bar
        // if(param == 'bar'){
        //     this.addBar();
        // }
    }
    /*
    * Unlock Scroll
    */
    static unlock() {
        // overflow default
        this._elem.style.overflow = '';
        // state
        this._elem.setAttribute('scrollControlState', 'unlock');
    }
    /*
    * Add Bar
    */
    static addBar() {
        // padding right == width scroll bar
        this._elem.style.paddingRight = this.size + 'px';
        // add object in position scroll bar
        let scrollControlElem = document.createElement('div');
        // add style in object
        scrollControlElem.setAttribute(`style`, `width: ${this.size}px; height: 100%; position: fixed; top: 0; right: 0; background-color: #fafafa;`);
        // add class in object
        scrollControlElem.setAttribute('class', 'scrollControlBar');
        // add object in DOOM
        this._elem.append(scrollControlElem);
    }
    /*
    * Remove Bar
    */
    static removeBar() {
        // body padding right default
        this._elem.style.paddingRight = '';
        // remove scrollControlElem
        if(document.querySelector('.scrollControlBar') != null) document.querySelector('.scrollControlBar').remove();
    }
}
