
const mouse = {
    x: 0,
    y: 0,
    down: false,
    downCount: 0,
    upCount: 0
};

function initMouse(el) {
    el.addEventListener('mousedown', handleMouseEvent);
    el.addEventListener('mouseup', handleMouseEvent);
    el.addEventListener('mousemove', handleMouseEvent);
    el.addEventListener('contextmenu', handleMouseEvent);

    const touchEventHandler = this.handleTouchEvent.bind(this);
    el.addEventListener('touchstart', touchEventHandler);
    el.addEventListener('touchend', touchEventHandler);
    el.addEventListener('touchcancel', touchEventHandler);
    el.addEventListener('touchmove', touchEventHandler);
}

function updateMouse() {
    if (mouse.down) {
        mouse.downCount++;
        mouse.upCount = 0;
    } else {
        mouse.downCount = 0;
        mouse.upCount++;
    }
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

    if (e.type === 'touchend') {
        // this.requestFullscreen();

        if (!document.fullscreenElement) {
            canvas.requestFullscreen();
            return;
        }
    }

    if (e.touches.length > 0) {
        const touch = e.touches[0];
        this.updatePosition(touch.clientX, touch.clientY);
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

    console.log('bounding rect', rect);

    const rectAspectRatio = rect.width / rect.height;

    if (rectAspectRatio - SCREEN_ASPECT_RATIO > 0.01) {
        const actualWidth = SCREEN_ASPECT_RATIO * rect.height;
        const excess = rect.width - actualWidth;
        rect = new Rect(Math.floor(excess / 2), 0, actualWidth, rect.height);
    }

    if (rectAspectRatio - SCREEN_ASPECT_RATIO < -0.01) {
        const actualHeight = rect.width / SCREEN_ASPECT_RATIO;
        const excess = rect.height - actualHeight;
        rect = new Rect(0, Math.floor(excess / 2), rect.width, actualHeight);
    }

    mouse.x = (SCREEN_WIDTH * (clientX - rect.left) / rect.width) | 0;
    mouse.y = (SCREEN_HEIGHT * (clientY - rect.top) / rect.height) | 0;
}
