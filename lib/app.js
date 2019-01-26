
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

    this.canvas = canvas;
    this.options = options || {};
    this.gl = gl;
    this.width = 1;
    this.height = 1;
    this.aspectRatio = 1.0;

    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    this.spriteSet = new wglt.SpriteSet(gl);
    this.keyboard = new wglt.Keyboard(canvas);
    this.keys = this.keyboard.keys;

    this.mouse = new wglt.Mouse(this);

    initMap();
    initEntities();

    map.initGl(gl);

    window.addEventListener('resize', this.handleResizeEvent.bind(this), false);
    this.handleResizeEvent();
    this.renderLoop();
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

    this.width = Math.round(width / scale);
    this.height = Math.round(height / scale);
    this.aspectRatio = this.width / this.height;

    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.canvas.style.left = '0';
    this.canvas.style.top = '0';
    this.canvas.style.width = width + 'px';
    this.canvas.style.height = height + 'px';
};

wglt.Application.prototype.renderLoop = function () {
    this.keyboard.update();
    this.mouse.update();

    const gl = this.gl;
    gl.viewport(0, 0, this.width, this.height);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Reset sprite index buffers
    this.spriteSet.positionArrayIndex = 0;
    this.spriteSet.texcoordArrayIndex = 0;
    this.spriteSet.colorArrayIndex = 0;

    if (this.update) {
        this.update();
    }

    this.spriteSet.drawSprites(this.width, this.height);

    requestAnimationFrame(this.renderLoop.bind(this));
};

/**
 * Draws a sprite.
 * @param {number} x The x-coordinate of the top-left corner on the screen.
 * @param {number} y The y-coordinate of the top-left corner on the screen.
 * @param {number} u The x-coordinate of the top-left corner on the sprite sheet.
 * @param {number} v The y-coordinate of the top-left corner on the sprite sheet.
 * @param {number} w The width of the sprite.
 * @param {number} h The height of the sprite.
 * @param {number=} opt_color Optional color.
 * @param {number=} opt_dw Optional destination width.
 * @param {number=} opt_dh Optional destination height.
 */
wglt.Application.prototype.drawTexture = function(x, y, u, v, w, h, opt_color, opt_dw, opt_dh) {
    this.spriteSet.drawTexture(x, y, u, v, w, h, opt_color, opt_dw, opt_dh);
};

/**
 * Draws a string.
 * @param {string} str The text string to draw.
 * @param {number} x The x-coordinate of the top-left corner.
 * @param {number} y The y-coordinate of the top-left corner.
 * @param {number=} opt_color Optional color.
 */
wglt.Application.prototype.drawString = function(str, x, y, opt_color) {
    this.spriteSet.drawString(str, x, y, opt_color);
};

/**
 * Draws a string horizontally centered.
 * @param {string} str The text string to draw.
 * @param {number} x The x-coordinate of the center.
 * @param {number} y The y-coordinate of the top-left corner.
 * @param {number=} opt_color Optional color.
 */
wglt.Application.prototype.drawCenteredString = function(str, x, y, opt_color) {
    this.spriteSet.drawCenteredString(str, x, y, opt_color);
};
