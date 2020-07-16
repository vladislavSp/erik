
class SaveField{

    /**
     * Data
    */
    constructor(){
        this.field = [...document.querySelectorAll('.order__field')];
        this.data = [];
    }

    /**
     * Init
    */
    init(){
        this.add();
        this.event();
    }

    /**
     * Add event
    */
    event() {
        this.field.map( (obj, index) => {
            obj.setAttribute('data-num-save', index);
            obj.addEventListener('keyup', this.ev.bind(this));
        });
    }

    /**
     * Event keydown
     * and save info in locastorage
    */
    ev() {
        // number element
        let num = event.target.getAttribute('data-num-save');
        // select data
        if(event.target.value == ''){
            this.data[num] = null;
        }else{
            this.data[num] = event.target.value;
        }
        // add localstorage
        localStorage.setItem('form', JSON.stringify(this.data));
    }

    /**
     * Event keydown
    */
    add() {
        // select data in localstorage
        let data = localStorage.getItem('form');
        // json parse
        data = JSON.parse(data);
        // insert data in input
        if (data) {
            data.map( (obj, index) => {
                this.field[index].value = obj;
                this.data[index] = obj;
            });
        }
    }
}

let savefield = new SaveField;
savefield.init();