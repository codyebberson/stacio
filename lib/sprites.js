
/**
 * Maximum number of elements per buffer.
 *
 * Some browsers / video cards allow large buffers, but 16-bit is the safe max.
 * https://stackoverflow.com/a/5018021/2051724
 *
 * @const {number}
 */
const BUFFER_SIZE = 65536;

const spriteVertexShader =
    'uniform vec2 u_viewportSize;' +
    'attribute vec2 a_position;' +
    'attribute vec2 a_texCoord;' +
    'attribute vec4 a_color;' +
    'varying vec2 v_texCoord;' +
    'varying vec4 v_color;' +
    'void main() {' +

    // convert the rectangle from pixels to 0.0 to 1.0
    'vec2 zeroToOne = a_position / u_viewportSize;' +

    // convert from 0->1 to 0->2
    'vec2 zeroToTwo = zeroToOne * 2.0;' +

    // convert from 0->2 to -1->+1 (clipspace)
    'vec2 clipSpace = zeroToTwo - 1.0;' +

    'gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);' +

    // pass the texCoord to the fragment shader
    // The GPU will interpolate this value between points.
    'v_texCoord = a_texCoord;' +
    'v_color = a_color;' +
    '}';

let spriteFragmentShader =
    'precision mediump float;' +

    // our texture
    'uniform sampler2D u_image;' +

    // the texCoords passed in from the vertex shader.
    'varying vec2 v_texCoord;' +

    // the color overrides passed in from the vertex shader.
    'varying vec4 v_color;' +

    'void main() {' +
    'gl_FragColor = texture2D(u_image, v_texCoord);' +
    'if (gl_FragColor.a < 0.1) discard;' +
    'if (v_color.a > 0.5) gl_FragColor = v_color;' +
    '}';

let program = null;
let viewportSizeLocation = null;
let positionLocation = null;
let texcoordLocation = null;
let colorLocation = null;
let resolutionLocation = null;
let viewportSizeBuffer = new Float32Array(2);
let positionBuffer = null;
let texcoordBuffer = null;
let colorBuffer = null;
let spriteTexture = null;
let positionArray = new Float32Array(BUFFER_SIZE);
let positionArrayIndex = 0;
let texcoordArray = new Float32Array(BUFFER_SIZE);
let texcoordArrayIndex = 0;
let colorUint8Array = new Uint8Array(BUFFER_SIZE);
let colorDataView = new DataView(colorUint8Array.buffer);
let colorArrayIndex = 0;

function initSprites(gl) {
    program = wglt.initShaderProgram(gl, spriteVertexShader, spriteFragmentShader);
    positionBuffer = gl.createBuffer();
    texcoordBuffer = gl.createBuffer();
    colorBuffer = gl.createBuffer();
    viewportSizeLocation = gl.getUniformLocation(program, "u_viewportSize");
    positionLocation = gl.getAttribLocation(program, 'a_position');
    texcoordLocation = gl.getAttribLocation(program, 'a_texCoord');
    colorLocation = gl.getAttribLocation(program, 'a_color');
    spriteTexture = wglt.createTexture(gl, 'img/graphics.png');
}

/**
 * Draws a string.
 * @param {string} str The text string to draw.
 * @param {number} x The x-coordinate of the top-left corner.
 * @param {number} y The y-coordinate of the top-left corner.
 * @param {number=} opt_color Optional color.
 */
function drawString(str, x, y, opt_color) {
    const lines = str.split('\n');
    for (let i = 0; i < lines.length; i++) {
        for (let j = 0; j < lines[i].length; j++) {
            drawChar(lines[i].charCodeAt(j), x + j * 4, y + i * 8, opt_color);
        }
    }
}

/**
 * Draws a character.
 * @param {number} c The ASCII character code.
 * @param {number} x The x-coordinate of the top-left corner.
 * @param {number} y The y-coordinate of the top-left corner.
 * @param {number=} opt_color Optional color.
 */
function drawChar(c, x, y, opt_color) {
    if (c >= 33 && c <= 127) {
        drawTexture(x, y, (c - 33) * 8, 0, 8, 10, opt_color);
    }
}

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
function drawTexture(x, y, u, v, w, h, opt_color, opt_dw, opt_dh) {
    if (!spriteTexture.loaded) {
        return;
    }

    const dw = opt_dw !== undefined ? opt_dw : w;
    const dh = opt_dh !== undefined ? opt_dh : h;
    const x2 = x + Math.abs(dw);
    const y2 = y + dh;
    const tx = u / spriteTexture.width;
    const ty = v / spriteTexture.height;
    const tx2 = (u + w) / spriteTexture.width;
    const ty2 = (v + h) / spriteTexture.height;
    const color = opt_color || 0;

    // First triangle
    positionArray[positionArrayIndex++] = x;
    positionArray[positionArrayIndex++] = y;
    positionArray[positionArrayIndex++] = x2;
    positionArray[positionArrayIndex++] = y;
    positionArray[positionArrayIndex++] = x;
    positionArray[positionArrayIndex++] = y2;

    texcoordArray[texcoordArrayIndex++] = tx;
    texcoordArray[texcoordArrayIndex++] = ty;
    texcoordArray[texcoordArrayIndex++] = tx2;
    texcoordArray[texcoordArrayIndex++] = ty;
    texcoordArray[texcoordArrayIndex++] = tx;
    texcoordArray[texcoordArrayIndex++] = ty2;

    // Second triangle
    positionArray[positionArrayIndex++] = x;
    positionArray[positionArrayIndex++] = y2;
    positionArray[positionArrayIndex++] = x2;
    positionArray[positionArrayIndex++] = y;
    positionArray[positionArrayIndex++] = x2;
    positionArray[positionArrayIndex++] = y2;

    texcoordArray[texcoordArrayIndex++] = tx;
    texcoordArray[texcoordArrayIndex++] = ty2;
    texcoordArray[texcoordArrayIndex++] = tx2;
    texcoordArray[texcoordArrayIndex++] = ty;
    texcoordArray[texcoordArrayIndex++] = tx2;
    texcoordArray[texcoordArrayIndex++] = ty2;

    for (let i = 0; i < 6; i++) {
        colorDataView.setUint32(colorArrayIndex, color, false);
        colorArrayIndex += 4;
    }
}

/**
 * Renders all sprites in the sprite buffers to the screen.
 */
function drawSprites() {
    if (!spriteTexture.loaded) {
        return;
    }

    // Tell it to use our program (pair of shaders)
    gl.useProgram(program);

    viewportSizeBuffer[0] = SCREEN_WIDTH;
    viewportSizeBuffer[1] = SCREEN_HEIGHT;
    gl.uniform2fv(viewportSizeLocation, viewportSizeBuffer);

    // Use the leonardo spriteTexture
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, spriteTexture);

    {
        // Bind the position buffer.
        gl.enableVertexAttribArray(positionLocation);
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, positionArray, gl.DYNAMIC_DRAW);

        // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
        let size = 2; // 2 components per iteration
        let type = gl.FLOAT; // the data is 32bit floats
        let normalize = false; // don't normalize the data
        let stride = 0; // 0 = move forward size * sizeof(type) each iteration to get the next position
        let offset = 0; // start at the beginning of the buffer
        gl.vertexAttribPointer(positionLocation, size, type, normalize, stride, offset);
    }

    {
        // Bind the texture coordinate buffer.
        gl.enableVertexAttribArray(texcoordLocation);
        gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, texcoordArray, gl.DYNAMIC_DRAW);

        // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
        let size = 2; // 2 components per iteration
        let type = gl.FLOAT; // the data is 32bit floats
        let normalize = false; // don't normalize the data
        let stride = 0; // 0 = move forward size * sizeof(type) each iteration to get the next position
        let offset = 0; // start at the beginning of the buffer
        gl.vertexAttribPointer(texcoordLocation, size, type, normalize, stride, offset)
    }

    {
        // Bind the color buffer.
        gl.enableVertexAttribArray(colorLocation);
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, colorUint8Array, gl.DYNAMIC_DRAW);

        // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
        let size = 4; // 4 components per iteration
        let type = gl.UNSIGNED_BYTE; // the data is 8-bit unsigned bytes
        let normalize = true; // Normalize from 0-255 to 0.0-1.0
        let stride = 0; // 0 = move forward size * sizeof(type) each iteration to get the next position
        let offset = 0; // start at the beginning of the buffer
        gl.vertexAttribPointer(colorLocation, size, type, normalize, stride, offset)
    }

    // Draw the rectangle.
    let primitiveType = gl.TRIANGLES;
    let offset = 0;
    let count = positionArrayIndex / 2;
    gl.drawArrays(primitiveType, offset, count);
}
