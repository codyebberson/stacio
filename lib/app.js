
/**
 * @constructor
 * @param {Element} el
 * @param {Object=} options
 */
wglt.Application = function (el, options) {
    const canvas = /** {HTMLCanvasElement} */ (el);
    const gl = canvas.getContext('webgl', { alpha: false, antialias: false });
    if (!gl) {
        return;
    }

    this.canvas = /** {HTMLCanvasElement} */ (canvas);
    this.options = options || {};
    this.gl = gl;

    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    initSprites(gl);

    this.keyboard = new wglt.Keyboard(canvas);
    this.keys = this.keyboard.keys;

    this.mouse = new wglt.Mouse(canvas);

    initMap();
    initEntities();

    map.initGl(gl);

    window.addEventListener('resize', this.handleResizeEvent.bind(this), false);
    this.handleResizeEvent();

    requestAnimationFrame(update);
};

/**
 * Handles window resize events.
 * Updates canvas size.
 */
wglt.Application.prototype.handleResizeEvent = function () {
    const width = window.innerWidth;
    const height = window.innerHeight;
    let scale = 1.0;

    if (width > height) {
        scale = Math.max(1, Math.min(Math.floor(width / 256.0), Math.floor(height / 144.0)));
    } else {
        scale = Math.max(1, Math.min(Math.floor(width / 144.0), Math.floor(height / 256.0)));
    }

    SCREEN_WIDTH = Math.round(width / scale);
    SCREEN_HEIGHT = Math.round(height / scale);
    SCREEN_ASPECT_RATIO = SCREEN_WIDTH / SCREEN_HEIGHT;

    this.canvas.width = SCREEN_WIDTH;
    this.canvas.height = SCREEN_HEIGHT;
    this.canvas.style.left = '0';
    this.canvas.style.top = '0';
    this.canvas.style.width = width + 'px';
    this.canvas.style.height = height + 'px';
};
