
/**
 * @constructor
 * @param {wglt.Application} app
 */
wglt.Mouse = function (app) {
    this.app = app;
    this.x = 0;
    this.y = 0;
    this.prevX = 0;
    this.prevY = 0;
    this.dx = 0;
    this.dy = 0;
    this.down = false;
    this.downCount = 0;
    this.upCount = 0;

    const el = app.canvas;

    const mouseHandler = this.handleMouseEvent.bind(this);
    el.addEventListener('mousedown', mouseHandler);
    el.addEventListener('mouseup', mouseHandler);
    el.addEventListener('mousemove', mouseHandler);
    el.addEventListener('contextmenu', mouseHandler);

    const touchHandler = this.handleTouchEvent.bind(this);
    el.addEventListener('touchstart', touchHandler);
    el.addEventListener('touchend', touchHandler);
    el.addEventListener('touchcancel', touchHandler);
    el.addEventListener('touchmove', touchHandler);
};

wglt.Mouse.prototype.update = function() {
    this.dx = this.x - this.prevX;
    this.dy = this.y - this.prevY;
    this.prevX = this.x;
    this.prevY = this.y;

    if (this.down) {
        this.downCount++;
        this.upCount = 0;
    } else {
        this.downCount = 0;
        this.upCount++;
    }
};

wglt.Mouse.prototype.handleMouseEvent = function(e) {
    e.stopPropagation();
    e.preventDefault();

    this.updatePosition(e.clientX, e.clientY);

    if (e.type === 'mousedown') {
        this.down = true;
        this.app.canvas.focus();
    }

    if (e.type === 'mouseup') {
        this.down = false;
    }
};

wglt.Mouse.prototype.handleTouchEvent = function(e) {
    e.stopPropagation();
    e.preventDefault();

    if (e.touches.length > 0) {
        const touch = e.touches[0];
        this.updatePosition(touch.clientX, touch.clientY);
        this.down = true;
    } else {
        this.down = false;
    }
};

wglt.Mouse.prototype.updatePosition = function(clientX, clientY) {
    let rect = this.app.canvas.getBoundingClientRect();

    // If the client rect is not the same aspect ratio as the canvas,
    // then we are fullscreen.
    // Need to update client rect accordingly.

    const rectAspectRatio = rect.width / rect.height;

    if (rectAspectRatio - this.app.aspectRatio > 0.01) {
        const actualWidth = this.app.aspectRatio * rect.height;
        const excess = rect.width - actualWidth;
        rect = new wglt.Rect(Math.floor(excess / 2), 0, actualWidth, rect.height);
    }

    if (rectAspectRatio - this.app.aspectRatio < -0.01) {
        const actualHeight = rect.width / this.app.aspectRatio;
        const excess = rect.height - actualHeight;
        rect = new wglt.Rect(0, Math.floor(excess / 2), rect.width, actualHeight);
    }

    this.x = (this.app.width * (clientX - rect.left) / rect.width) | 0;
    this.y = (this.app.height * (clientY - rect.top) / rect.height) | 0;
};

function isMouseInRect(x, y, w, h) {
    return mouse.x >= x && mouse.x < x + w && mouse.y >= y && mouse.y < y + h;
}
