
// Shader
const tilemapVS =
    'precision mediump float;' +

    'attribute vec2 position;' +
    'attribute vec2 texture;' +

    'varying vec2 pixelCoord;' +
    'varying vec2 texCoord;' +

    'uniform vec2 viewOffset;' +
    'uniform vec2 viewportSize;' +
    'uniform vec2 mapSize;' +

    'void main(void) {' +
    '   pixelCoord = (texture * viewportSize) + viewOffset;' +
    '   texCoord = pixelCoord / mapSize / ' + TILE_SIZE + '.0;' +
    '   gl_Position = vec4(position, 0.0, 1.0);' +
    '}';

const tilemapFS =
    'precision mediump float;' +

    'varying vec2 pixelCoord;' +
    'varying vec2 texCoord;' +

    'uniform sampler2D tiles;' +
    'uniform sampler2D sprites;' +

    'void main(void) {' +
    '   vec4 tile = texture2D(tiles, texCoord);' +
    '   if(tile.x == 1.0 && tile.y == 1.0) { discard; }' +
    '   vec2 spriteOffset = floor(tile.xy * 256.0) * ' + TILE_SIZE + '.0;' +
    '   vec2 spriteCoord = mod(pixelCoord, ' + TILE_SIZE + '.0);' +
    '   gl_FragColor = texture2D(sprites, (spriteOffset + spriteCoord) / ' + TEXTURE_SIZE + '.0);' +
    '}';

function TileMapLayer(gl, map, imageWidth, imageHeight, repeat) {
    this.scrollScaleX = 1;
    this.scrollScaleY = 1;

    const imageData = new Uint8Array(4 * imageWidth * imageHeight);
    let i = 0;
    for (let y = 0; y < imageHeight; y++) {
        for (let x = 0; x < imageWidth; x++) {
            //let t = map[y * imageWidth + x];
            let t = map[y][x];
            if (t === 0) {
                imageData[i++] = 255;
                imageData[i++] = 255;
            } else {
                imageData[i++] = Math.floor((t - 1) % 64);
                imageData[i++] = Math.floor((t - 1) / 64);
            }

            imageData[i++] = 255; // Green is ignored
            imageData[i++] = 255; // Alpha is max for opaque
        }
    }

    this.tileTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.tileTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, imageWidth, imageHeight, 0, gl.RGBA, gl.UNSIGNED_BYTE, imageData);

    // MUST be filtered with NEAREST or tile lookup fails
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

    if (repeat) {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    } else {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    }

    this.mapSize = new Float32Array(2);
    this.mapSize[0] = imageWidth;
    this.mapSize[1] = imageHeight;
};

var TileMap = function (gl) {
    this.gl = gl;
    this.viewportSize = new Float32Array(2);
    this.layers = [];

    var quadVerts = [
        //x  y  u  v
        -1, -1, 0, 1,
        1, -1, 1, 1,
        1, 1, 1, 0,

        -1, -1, 0, 1,
        1, 1, 1, 0,
        -1, 1, 0, 0
    ];

    this.quadVertBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quadVertBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(quadVerts), gl.STATIC_DRAW);

    this.tilemapShader = initShaderProgram(gl, tilemapVS, tilemapFS);
    this.positionAttribute = gl.getAttribLocation(this.tilemapShader, "position");
    this.textureAttribute = gl.getAttribLocation(this.tilemapShader, "texture");
    this.viewportSizeUniform = gl.getUniformLocation(this.tilemapShader, "viewportSize");
    this.viewOffsetUniform = gl.getUniformLocation(this.tilemapShader, "viewOffset");
    this.mapSizeUniform = gl.getUniformLocation(this.tilemapShader, "mapSize");
    this.tileSamplerUniform = gl.getUniformLocation(this.tilemapShader, "tiles");
    this.spriteSamplerUniform = gl.getUniformLocation(this.tilemapShader, "sprites");
};

TileMap.prototype.resizeViewport = function (width, height) {
    this.viewportSize[0] = width;
    this.viewportSize[1] = height;
};

TileMap.prototype.draw = function (x, y) {
    if (!spriteTexture.loaded) {
        return;
    }

    var gl = this.gl;

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    gl.useProgram(this.tilemapShader);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.quadVertBuffer);

    gl.enableVertexAttribArray(this.positionAttribute);
    gl.enableVertexAttribArray(this.textureAttribute);
    gl.vertexAttribPointer(this.positionAttribute, 2, gl.FLOAT, false, 16, 0);
    gl.vertexAttribPointer(this.textureAttribute, 2, gl.FLOAT, false, 16, 8);

    gl.uniform2fv(this.viewportSizeUniform, this.viewportSize);

    gl.activeTexture(gl.TEXTURE0);
    gl.uniform1i(this.spriteSamplerUniform, 0);

    gl.activeTexture(gl.TEXTURE1);
    gl.uniform1i(this.tileSamplerUniform, 1);

    // Draw each layer of the map
    for (let i = 0; i < this.layers.length; i++) {
        const layer = this.layers[i];
        gl.uniform2f(this.viewOffsetUniform, Math.floor(x * layer.scrollScaleX), Math.floor(y * layer.scrollScaleY));
        gl.uniform2fv(this.mapSizeUniform, layer.mapSize);
        gl.bindTexture(gl.TEXTURE_2D, layer.tileTexture);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
};
