
/**
 * @constructor
 * @param {Element} el
 */
wglt.Keyboard = function (el) {
    this.el = el;
    this.keys = new Array(256);

    for (let i = 0; i < 256; i++) {
        this.keys[i] = new wglt.Input();
    }

    // Ensure that the element can receive keyboard events
    el.tabIndex = 0;

    const self = this;

    el.addEventListener('keydown', function (e) {
        self.setKey(e, true);
    });

    el.addEventListener('keyup', function (e) {
        self.setKey(e, false);
    });
};

wglt.Keyboard.prototype.update = function() {
    for (let i = 0; i < 256; i++) {
        this.keys[i].update();
    }
};

wglt.Keyboard.prototype.setKey = function(e, state) {
    e.stopPropagation();
    e.preventDefault();

    const code = e.keyCode;
    if (code >= 0 && code < 256) {
        this.keys[code].down = state;
    }
};
