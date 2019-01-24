
/**
 * @constructor
 * @param {Element} el
 */
wglt.Mouse = function (el) {
    this.el = el;
    this.x = 0;
    this.y = 0;
    this.dx = 0;
    this.dy = 0;
    this.down = false;
    this.downCount = 0;
    this.upCount = 0;

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
        this.el.focus();
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
}

wglt.Mouse.prototype.updatePosition = function(clientX, clientY) {
    let rect = this.el.getBoundingClientRect();

    // If the client rect is not the same aspect ratio as this.el,
    // then we are fullscreen.
    // Need to update client rect accordingly.

    const rectAspectRatio = rect.width / rect.height;

    if (rectAspectRatio - SCREEN_ASPECT_RATIO > 0.01) {
        const actualWidth = SCREEN_ASPECT_RATIO * rect.height;
        const excess = rect.width - actualWidth;
        rect = new wglt.Rect(Math.floor(excess / 2), 0, actualWidth, rect.height);
    }

    if (rectAspectRatio - SCREEN_ASPECT_RATIO < -0.01) {
        const actualHeight = rect.width / SCREEN_ASPECT_RATIO;
        const excess = rect.height - actualHeight;
        rect = new wglt.Rect(0, Math.floor(excess / 2), rect.width, actualHeight);
    }

    const oldX = this.x;
    const oldY = this.y;
    this.x = (SCREEN_WIDTH * (clientX - rect.left) / rect.width) | 0;
    this.y = (SCREEN_HEIGHT * (clientY - rect.top) / rect.height) | 0;
    this.dx = this.x - oldX;
    this.dy = this.y - oldY;
}

function isMouseInRect(x, y, w, h) {
    return mouse.x >= x && mouse.x < x + w && mouse.y >= y && mouse.y < y + h;
}
