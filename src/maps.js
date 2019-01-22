
const MAP_LAYERS = 3;
const MAP_WIDTH = 256;
const MAP_HEIGHT = 256;

const SECTOR_WIDTH = 40;
const SECTOR_HEIGHT = 40;
const SECTOR_ROOM_COUNT = 10;

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

let map = null;
let sectors = null;
let sectorGrid = null;
let sectorParents = null;

function initMap() {
    map = new TileMap(MAP_WIDTH, MAP_HEIGHT, MAP_LAYERS);
    sectors = [];
    sectorGrid = [];
    sectorParents = [];

    for (let y = 0; y < 4; y++) {
        sectorGrid.push(new Array(4));
        for (let x = 0; x < 4; x++) {
            sectorGrid[y][x] = null;
        }
    }

    for (let i = 0; i < 10; i++) {
        const sector = {
            level: i,
            x: 0,
            y: 0,
            parent: null,
            childrenSlots: 0,
            children: [],
            rooms: []
        };

        if (i === 0) {
            sector.x = Math.floor(Math.random() * 4);
            sector.y = Math.floor(Math.random() * 4);
        } else {
            const parent = sectorParents[Math.floor(Math.random() * sectorParents.length)];
            parent.children.push(sector);
            parent.childrenSlots--;
            sector.parent = parent;

            if (parent.x > 0 && !sectorGrid[parent.y][parent.x - 1]) {
                sector.x = parent.x - 1;
                sector.y = parent.y;
            }
            if (parent.y > 0 && !sectorGrid[parent.y - 1][parent.x]) {
                sector.x = parent.x;
                sector.y = parent.y - 1;
            }
            if (parent.x < 3 && !sectorGrid[parent.y][parent.x + 1]) {
                sector.x = parent.x + 1;
                sector.y = parent.y;
            }
            if (parent.y < 3 && !sectorGrid[parent.y + 1][parent.x]) {
                sector.x = parent.x;
                sector.y = parent.y + 1;
            }
        }

        sector.rect = new Rect(
            sector.x * SECTOR_WIDTH,
            sector.y * SECTOR_HEIGHT,
            SECTOR_WIDTH,
            SECTOR_HEIGHT);

        sectors.push(sector);
        sectorGrid[sector.y][sector.x] = sector;

        // Update possible parents
        sectorParents = [];
        for (let j = 0; j < sectors.length; j++) {
            const s = sectors[j];
            s.childrenSlots = 0;
            if (s.x > 0 && !sectorGrid[s.y][s.x - 1]) {
                s.childrenSlots++;
            }
            if (s.y > 0 && !sectorGrid[s.y - 1][s.x]) {
                s.childrenSlots++;
            }
            if (s.x < 3 && !sectorGrid[s.y][s.x + 1]) {
                s.childrenSlots++;
            }
            if (s.y < 3 && !sectorGrid[s.y + 1][s.x]) {
                s.childrenSlots++;
            }
            if (s.childrenSlots > 0) {
                sectorParents.push(s);
            }
        }
    }

    for (let j = 0; j < sectors.length; j++) {
        const sector = sectors[j];
        const rooms = sector.rooms;

        // Always add 4 rooms on the cardinal directions
        const westRoom = new Rect(sector.rect.x1 + 1, sector.rect.getCenter().y - 2, 5, 5);
        createRoom(westRoom);
        rooms.push(westRoom);

        const eastRoom = new Rect(sector.rect.x2 - 5, sector.rect.getCenter().y - 2, 5, 5);
        createRoom(eastRoom);
        rooms.push(eastRoom);

        const northRoom = new Rect(sector.rect.getCenter().x - 2, sector.rect.y1 + 1, 5, 5);
        createRoom(northRoom);
        rooms.push(northRoom);

        const southRoom = new Rect(sector.rect.getCenter().x - 2, sector.rect.y2 - 5, 5, 5);
        createRoom(southRoom);
        rooms.push(southRoom);

        while (rooms.length < SECTOR_ROOM_COUNT) {
            const w = chooseBetween(ROOM_MIN_WIDTH, ROOM_MAX_WIDTH);
            const h = chooseBetween(ROOM_MIN_HEIGHT, ROOM_MAX_HEIGHT);
            const x = chooseBetween(sector.rect.x1 + 2, sector.rect.x2 - ROOM_MAX_WIDTH - 3);
            const y = chooseBetween(sector.rect.y1 + 2, sector.rect.y2 - ROOM_MAX_HEIGHT - 3);
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
                rooms.push(rect);
            }
        }

        // Shuffle the order of the rooms
        shuffle(rooms);

        // Create tunnels from one room to the next
        for (let i = 1; i < rooms.length; i++) {
            const center = rooms[i].getCenter();
            const prev = rooms[i - 1].getCenter();

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

        // Create a tunnel from the parent sector to this sector
        if (sector.parent) {
            if (sector.parent.x < sector.x) {
                // West
                createHTunnel(sector.rect.x1 - 3, sector.rect.x1 + 3, sector.rect.getCenter().y);
            } else if (sector.parent.x > sector.x) {
                // East
                createHTunnel(sector.rect.x2 - 3, sector.rect.x2 + 3, sector.rect.getCenter().y);
            } else if (sector.parent.y < sector.y) {
                // North
                createVTunnel(sector.rect.y1 - 3, sector.rect.y1 + 3, sector.rect.getCenter().x);
            } else if (sector.parent.y > sector.y) {
                // South
                createVTunnel(sector.rect.y2 - 3, sector.rect.y2 + 3, sector.rect.getCenter().x);
            }
        }
    }

    // Add walls around open floor
    for (let y = 0; y < MAP_HEIGHT; y++) {
        for (let x = 0; x < MAP_WIDTH; x++) {
            if (map.isSolid(x, y)) {
                if (!map.isSolid(x, y + 1)) {
                    // Half wall
                    map.setTile(0, x, y, chooseBetween(TILE_SILVER_WALL1, TILE_SILVER_WALL6), true);
                } else if (map.getTile(x, y) !== TILE_EMPTY && map.getTile(x, y + 1) === TILE_EMPTY) {
                    // Half wall
                    map.setTile(0, x, y, chooseBetween(TILE_SILVER_WALL1, TILE_SILVER_WALL6), true);
                } else if (!map.isSolid(x, y - 1) ||
                    !map.isSolid(x - 1, y) ||
                    !map.isSolid(x + 1, y) ||
                    !map.isSolid(x - 1, y - 1) ||
                    !map.isSolid(x + 1, y - 1) ||
                    !map.isSolid(x - 1, y + 1) ||
                    !map.isSolid(x + 1, y + 1)) {
                    // Full wall
                    map.setTile(0, x, y, chooseBetween(TILE_SILVER_WALL7, TILE_SILVER_WALL10), true);
                }
            }
        }
    }
}

function createRoom(rect) {
    const x1 = rect.x1;
    const y1 = rect.y1;
    const x2 = rect.x2;
    const y2 = rect.y2;
    for (let y = y1; y < y2; y++) {
        for (let x = x1; x < x2; x++) {
            map.setTile(0, x, y, chooseBetween(TILE_STEEL1, TILE_STEEL4), false);
        }
    }
}

function createHTunnel(x1, x2, y) {
    for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
        map.setTile(0, x, y, chooseBetween(TILE_STEEL1, TILE_STEEL4), false);
    }
}

function createVTunnel(y1, y2, x) {
    for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
        map.setTile(0, x, y, chooseBetween(TILE_STEEL1, TILE_STEEL4), false);
    }
}

function chooseBetween(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}
