
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
    // '   gl_FragColor.a = 0.5;' +
    '   gl_FragColor.a = tile.a;' +
    '}';


function TileMapCell(x, y, tile) {
    this.x = x;
    this.y = y;
    this.tile = tile;
    this.blocked = true;
    this.visible = false;
    this.seen = false;
    this.g = 0;
    this.h = 0;
    this.prev = null;
}

function TileMapCell(x, y, tile) {
    this.x = x;
    this.y = y;
    this.tile = tile;
    this.blocked = true;
    this.visible = false;
    this.g = 0;
    this.h = 0;
    this.prev = null;
}

function TileMapLayer(width, height) {
    this.width = width;
    this.height = height;
    this.texture = null;
    this.imageData = new Uint8Array(4 * width * height);
    this.dimensions = new Float32Array([width, height]);
    this.clear();
}

TileMapLayer.prototype.clear = function() {
    for (let i = 0; i < this.imageData.length; i++) {
        this.imageData[i] = 255;
    }
};

TileMapLayer.prototype.setAlpha = function(x, y, alpha) {
    this.imageData[4 * (y * this.width + x) + 3] = alpha;
};

TileMapLayer.prototype.initGl = function(gl) {
    this.texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.width, this.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, this.imageData);

    // MUST be filtered with NEAREST or tile lookup fails
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
};

TileMapLayer.prototype.updateGl = function(gl) {
    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, this.width, this.height, gl.RGBA, gl.UNSIGNED_BYTE, this.imageData);
};

function TileMap(width, height, layerCount) {
    this.width = width;
    this.height = height;
    this.grid = new Array(height);
    this.layers = new Array(layerCount);
    this.viewportSize = new Float32Array(2);

    for (let y = 0; y < height; y++) {
        this.grid[y] = new Array(width);
        for (let x = 0; x < width; x++) {
            this.grid[y][x] = new TileMapCell(x, y, 0);
        }
    }

    for (let i = 0; i < layerCount; i++) {
        this.layers[i] = new TileMapLayer(width, height);
    }
}

TileMap.prototype.initGl = function(gl) {
    this.gl = gl;

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

    for (let i = 0; i < this.layers.length; i++) {
        this.layers[i].initGl(gl);
    }
};

TileMap.prototype.setTile = function(layerIndex, x, y, tile, blocked) {
    this.grid[y][x].tile = tile;
    this.grid[y][x].blocked = blocked;

    const layer = this.layers[layerIndex];
    const ti = 4 * (y * layer.width + x);
    const tx = tile === 0 ? 255 : ((tile - 1) % 64) | 0;
    const ty = tile === 0 ? 255 : ((tile - 1) / 64) | 0;
    layer.imageData[ti + 0] = tx;
    layer.imageData[ti + 1] = ty;
};

TileMap.prototype.getCell = function(tx, ty) {
    if (tx < 0 || tx >= MAP_WIDTH || ty < 0 || ty >= MAP_HEIGHT) {
        return null;
    }
    return this.grid[ty][tx];
};

TileMap.prototype.getTile = function(tx, ty) {
    const cell = this.getCell(tx, ty);
    return cell ? cell.tile : TILE_SILVER_WALL1;
};

TileMap.prototype.isSolid = function(tx, ty) {
    const cell = this.getCell(tx, ty);
    return !cell || cell.blocked;
};

TileMap.prototype.isVisible = function(tx, ty) {
    const cell = this.getCell(tx, ty);
    return cell && cell.visible;
};

TileMap.prototype.isSeen = function(tx, ty) {
    const cell = this.getCell(tx, ty);
    return cell && cell.seen;
};

TileMap.prototype.draw = function (x, y, width, height) {
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

    this.viewportSize[0] = width;
    this.viewportSize[1] = height;
    gl.uniform2fv(this.viewportSizeUniform, this.viewportSize);

    gl.activeTexture(gl.TEXTURE0);
    gl.uniform1i(this.spriteSamplerUniform, 0);

    gl.activeTexture(gl.TEXTURE1);
    gl.uniform1i(this.tileSamplerUniform, 1);

    const tx1 = (x / TILE_SIZE) | 0;
    const ty1 = (y / TILE_SIZE) | 0;
    const tx2 = ((x + width) / TILE_SIZE) | 0;
    const ty2 = ((y + height) / TILE_SIZE) | 0;

    // Draw each layer of the map
    for (let i = 0; i < this.layers.length; i++) {
        const layer = this.layers[i];

        for (let ty = ty1; ty <= ty2; ty++) {
            for (let tx = tx1; tx <= tx2; tx++) {
                const alpha = this.isVisible(tx, ty) ? 255 : this.isSeen(tx, ty) ? 144 : 0;
                layer.setAlpha(tx, ty, alpha);
            }
        }

        gl.uniform2f(this.viewOffsetUniform, x, y);
        gl.uniform2fv(this.mapSizeUniform, layer.dimensions);
        gl.bindTexture(gl.TEXTURE_2D, layer.texture);
        layer.updateGl(gl);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
};
