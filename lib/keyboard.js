
const KEY_BACKSPACE = 8;
const KEY_TAB = 9;
const KEY_ENTER = 13;
const KEY_SHIFT = 16;
const KEY_CTRL = 17;
const KEY_ALT = 18;
const KEY_PAUSE = 19;
const KEY_CAPS_LOCK = 20;
const KEY_ESCAPE = 27;
const KEY_SPACE = 32;
const KEY_PAGE_UP = 33;
const KEY_PAGE_DOWN = 34;
const KEY_END = 35;
const KEY_HOME = 36;
const KEY_LEFT = 37;
const KEY_UP = 38;
const KEY_RIGHT = 39;
const KEY_DOWN = 40;
const KEY_INSERT = 45;
const KEY_DELETE = 46;
const KEY_0 = 48;
const KEY_1 = 49;
const KEY_2 = 50;
const KEY_3 = 51;
const KEY_4 = 52;
const KEY_5 = 53;
const KEY_6 = 54;
const KEY_7 = 55;
const KEY_8 = 56;
const KEY_9 = 57;
const KEY_A = 65;
const KEY_B = 66;
const KEY_C = 67;
const KEY_D = 68;
const KEY_E = 69;
const KEY_F = 70;
const KEY_G = 71;
const KEY_H = 72;
const KEY_I = 73;
const KEY_J = 74;
const KEY_K = 75;
const KEY_L = 76;
const KEY_M = 77;
const KEY_N = 78;
const KEY_O = 79;
const KEY_P = 80;
const KEY_Q = 81;
const KEY_R = 82;
const KEY_S = 83;
const KEY_T = 84;
const KEY_U = 85;
const KEY_V = 86;
const KEY_W = 87;
const KEY_X = 88;
const KEY_Y = 89;
const KEY_Z = 90;
const KEY_NUMPAD_0 = 96;
const KEY_NUMPAD_1 = 97;
const KEY_NUMPAD_2 = 98;
const KEY_NUMPAD_3 = 99;
const KEY_NUMPAD_4 = 100;
const KEY_NUMPAD_5 = 101;
const KEY_NUMPAD_6 = 102;
const KEY_NUMPAD_7 = 103;
const KEY_NUMPAD_8 = 104;
const KEY_NUMPAD_9 = 105;

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
