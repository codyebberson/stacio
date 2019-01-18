
const MAP_LAYERS = 3;
const MAP_WIDTH = 256;
const MAP_HEIGHT = 256;

const SECTOR_WIDTH = 64;
const SECTOR_HEIGHT = 64;

const ROOM_MIN_WIDTH = 5;
const ROOM_MAX_WIDTH = 12;
const ROOM_MIN_HEIGHT = 5;
const ROOM_MAX_HEIGHT = 8;

const TILE_EMPTY = 0;
const TILE_STEEL1 = 1 + (144 / 16) * 64 + (256 / 16); // 256, 144
const TILE_STEEL2 = TILE_STEEL1 + 1;
const TILE_STEEL4 = TILE_STEEL1 + 3;

const TILE_SILVER_WALL1 = 1 + (16 / 16) * 64 + (256 / 16); // 256, 16
const TILE_SILVER_WALL6 = TILE_SILVER_WALL1 + 5;
const TILE_SILVER_WALL7 = TILE_SILVER_WALL1 + 6;
const TILE_SILVER_WALL10 = TILE_SILVER_WALL1 + 9;

const mapLayers = [];

for (let i = 0; i < MAP_LAYERS; i++) {
    const layer = new Array(MAP_HEIGHT);
    for (let y = 0; y < MAP_HEIGHT; y++) {
        const row = new Array(MAP_WIDTH);
        for (let x = 0; x < MAP_WIDTH; x++) {
            row[x] = TILE_EMPTY;
        }
        layer[y] = row;
    }
    mapLayers[i] = layer;
}

const rooms = [];

while (rooms.length < 20) {
    const w = chooseBetween(ROOM_MIN_WIDTH, ROOM_MAX_WIDTH);
    const h = chooseBetween(ROOM_MIN_HEIGHT, ROOM_MAX_HEIGHT);
    const x = chooseBetween(1, SECTOR_WIDTH - w - 1);
    const y = chooseBetween(1, SECTOR_WIDTH - h - 1);
    const rect = new Rect(x, y, w, h);

    let intersects = false;
    for (let i = 0; i < rooms.length; i++) {
        if (rect.intersects(rooms[i])) {
            intersects = true;
            break;
        }
    }

    if (!intersects) {
        createRoom(rect);

        const center = rect.getCenter();

        if (rooms.length === 0) {
            // First room
            // player.x = TILE_SIZE * center.x;
            // player.y = TILE_SIZE * center.y;

        } else {

            // Center coordinates of previous room
            const prev = rooms[rooms.length - 1].getCenter();

            // Draw a coin (random number that is either 0 or 1)
            if (Math.random() < 0.5) {
                // First move horizontally, then vertically
                createHTunnel(prev.x, center.x, prev.y);
                createVTunnel(prev.y, center.y, center.x);
            } else {
                // First move vertically, then horizontally
                createVTunnel(prev.y, center.y, prev.x);
                createHTunnel(prev.x, center.x, center.y);
            }
        }

        rooms.push(rect);
    }
}

for (let y = 0; y < MAP_HEIGHT; y++) {
    for (let x = 0; x < MAP_WIDTH; x++) {
        // if (Math.random() > 0.5) {
        //     mapLayers[0][y][x] = TILE_STEEL1;
        // } else {
        //     mapLayers[0][y][x] = TILE_STEEL2;
        // }
        // const north = y > 0 && mapLayers[0][y - 1][x]
        // if (isSolid(x, y) && !isSolid(x, y + 1)) {

        // }

        if (isSolid(x, y)) {
            if (!isSolid(x, y + 1)) {
                // Half wall
                mapLayers[0][y][x] = chooseBetween(TILE_SILVER_WALL1, TILE_SILVER_WALL6);
            } else if (getTile(x, y) !== TILE_EMPTY && getTile(x, y + 1) === TILE_EMPTY) {
                // Half wall
                mapLayers[0][y][x] = chooseBetween(TILE_SILVER_WALL1, TILE_SILVER_WALL6);
            } else if (!isSolid(x, y - 1) ||
                !isSolid(x - 1, y) ||
                !isSolid(x + 1, y) ||
                !isSolid(x - 1, y - 1) ||
                !isSolid(x + 1, y - 1) ||
                !isSolid(x - 1, y + 1) ||
                !isSolid(x + 1, y + 1)) {
                // Full wall
                mapLayers[0][y][x] = chooseBetween(TILE_SILVER_WALL7, TILE_SILVER_WALL10);
            }
        }
    }
}

function createRoom(rect) {
    const x1 = rect.x1;
    const y1 = rect.y1;
    const x2 = rect.x2;
    const y2 = rect.y2;
    for (let y = y1; y <= y2; y++) {
        for (let x = x1; x <= x2; x++) {
            mapLayers[0][y][x] = chooseBetween(TILE_STEEL1, TILE_STEEL4);
        }
    }
    // for (let x = x1; x <= x2; x++) {
    //     mapLayers[0][y1][x] = chooseBetween(TILE_SILVER_WALL1, TILE_SILVER_WALL6);
    // }
    // for (let y = y1; y <= y2; y++) {
    //     mapLayers[0][y][x1] = chooseBetween(TILE_SILVER_WALL7, TILE_SILVER_WALL10);
    //     mapLayers[0][y][x2] = chooseBetween(TILE_SILVER_WALL7, TILE_SILVER_WALL10);
    // }
    // for (let x = x1; x <= x2; x++) {
    //     mapLayers[0][y2][x] = chooseBetween(TILE_SILVER_WALL1, TILE_SILVER_WALL6);
    // }
}

function createHTunnel(x1, x2, y) {
    for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
        // map[y][x].blocked = false;
        // map[y][x].blockSight = false;
        // mapLayers[0][y - 1][x] = chooseBetween(TILE_SILVER_WALL1, TILE_SILVER_WALL6);
        mapLayers[0][y + 0][x] = chooseBetween(TILE_STEEL1, TILE_STEEL4);
        // mapLayers[0][y + 1][x] = chooseBetween(TILE_SILVER_WALL1, TILE_SILVER_WALL6);
    }
}

function createVTunnel(y1, y2, x) {
    for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
        // map[y][x].blocked = false;
        // map[y][x].blockSight = false;
        // mapLayers[0][y][x - 1] = chooseBetween(TILE_SILVER_WALL7, TILE_SILVER_WALL10);
        mapLayers[0][y][x + 0] = chooseBetween(TILE_STEEL1, TILE_STEEL4);
        // mapLayers[0][y][x + 1] = chooseBetween(TILE_SILVER_WALL7, TILE_SILVER_WALL10);
    }
}

function chooseBetween(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

function getTile(tx, ty) {
    if (tx < 0 || tx >= MAP_WIDTH || ty < 0 || ty >= MAP_HEIGHT) {
        return TILE_SILVER_WALL1;
    }
    return mapLayers[0][ty][tx];
}

function isSolid(tx, ty) {
    const t = getTile(tx, ty);
    // return t >= TILE_SILVER_WALL1 && t <= TILE_SILVER_WALL10;
    return !(t >= TILE_STEEL1 && t <= TILE_STEEL4);
}
