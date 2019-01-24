
const mouse = new Input();
mouse.x = 0;
mouse.y = 0;
mouse.dx = 0;
mouse.dy = 0;

function initMouse(el) {
    el.addEventListener('mousedown', handleMouseEvent);
    el.addEventListener('mouseup', handleMouseEvent);
    el.addEventListener('mousemove', handleMouseEvent);
    el.addEventListener('contextmenu', handleMouseEvent);

    el.addEventListener('touchstart', handleTouchEvent);
    el.addEventListener('touchend', handleTouchEvent);
    el.addEventListener('touchcancel', handleTouchEvent);
    el.addEventListener('touchmove', handleTouchEvent);
}

function updateMouse() {
    mouse.update();
}

function handleMouseEvent(e) {
    e.stopPropagation();
    e.preventDefault();

    updatePosition(e.clientX, e.clientY);

    if (e.type === 'mousedown') {
        mouse.down = true;
        canvas.focus();
    }

    if (e.type === 'mouseup') {
        mouse.down = false;
    }
}

function handleTouchEvent(e) {
    e.stopPropagation();
    e.preventDefault();

    if (e.touches.length > 0) {
        const touch = e.touches[0];
        updatePosition(touch.clientX, touch.clientY);
        mouse.down = true;
    } else {
        mouse.down = false;
    }
}

function updatePosition(clientX, clientY) {
    let rect = canvas.getBoundingClientRect();

    // If the client rect is not the same aspect ratio as canvas,
    // then we are fullscreen.
    // Need to update client rect accordingly.

    const rectAspectRatio = rect.width / rect.height;

    if (rectAspectRatio - SCREEN_ASPECT_RATIO > 0.01) {
        const actualWidth = SCREEN_ASPECT_RATIO * rect.height;
        const excess = rect.width - actualWidth;
        rect = new Rect2(Math.floor(excess / 2), 0, actualWidth, rect.height);
    }

    if (rectAspectRatio - SCREEN_ASPECT_RATIO < -0.01) {
        const actualHeight = rect.width / SCREEN_ASPECT_RATIO;
        const excess = rect.height - actualHeight;
        rect = new Rect2(0, Math.floor(excess / 2), rect.width, actualHeight);
    }

    const oldX = mouse.x;
    const oldY = mouse.y;
    mouse.x = (SCREEN_WIDTH * (clientX - rect.left) / rect.width) | 0;
    mouse.y = (SCREEN_HEIGHT * (clientY - rect.top) / rect.height) | 0;
    mouse.dx = mouse.x - oldX;
    mouse.dy = mouse.y - oldY;
}

function isMouseInRect(x, y, w, h) {
    return mouse.x >= x && mouse.x < x + w && mouse.y >= y && mouse.y < y + h;
}