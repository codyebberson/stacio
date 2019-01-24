
const keys = new Array(256);
for (let i = 0; i < 256; i++) {
    keys[i] = new wglt.Input();
}

function updateKeys() {
    for (let i = 0; i < 256; i++) {
        keys[i].update();
    }
}

function setKey(e, state) {
    e.stopPropagation();
    e.preventDefault();

    const code = e.keyCode;
    if (code >= 0 && code < 256) {
        keys[code].down = state;
    }
}

window.onload = function () {
    document.addEventListener('keydown', function (e) {
        setKey(e, true);
    });

    document.addEventListener('keyup', function (e) {
        setKey(e, false);
    });
};