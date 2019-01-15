
const keys = new Array(256);

function setKey(code, state) {
    if (code >= 0 && code < 256) {
        keys[code] = state;
    }
}

window.onload = function () {
    document.addEventListener('keydown', function (e) {
        setKey(e.keyCode, true);
    });

    document.addEventListener('keyup', function (e) {
        setKey(e.keyCode, false);
    });
};