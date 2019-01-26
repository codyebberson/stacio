
const MAP_LAYERS = 3;
const MAP_WIDTH = 256;
const MAP_HEIGHT = 256;

const SECTOR_WIDTH = 40;
const SECTOR_HEIGHT = 40;

const TILE_EMPTY = 0;
const TILE_GRAY_WALL_1 = 81;
const TILE_GRAY_WALL_2 = 82;
const TILE_GRAY_WALL_3 = 83;
const TILE_GRAY_WALL_4 = 84;
const TILE_GRAY_WALL_5 = 85;
const TILE_GRAY_WALL_6 = 86;
const TILE_ORANGE_WALL_1 = 145;
const TILE_ORANGE_WALL_2 = 146;
const TILE_ORANGE_WALL_3 = 147;
const TILE_ORANGE_WALL_4 = 148;
const TILE_ORANGE_WALL_5 = 149;
const TILE_ORANGE_WALL_6 = 150;
const TILE_WHITE_WALL_1 = 209;
const TILE_WHITE_WALL_2 = 210;
const TILE_WHITE_WALL_3 = 211;
const TILE_WHITE_WALL_4 = 212;
const TILE_WHITE_WALL_5 = 213;
const TILE_WHITE_WALL_6 = 214;
const TILE_GREEN_WALL_1 = 273;
const TILE_GREEN_WALL_2 = 274;
const TILE_GREEN_WALL_3 = 275;
const TILE_GREEN_WALL_4 = 276;
const TILE_GREEN_WALL_5 = 277;
const TILE_GREEN_WALL_6 = 278;
const TILE_PINK_WALL_1 = 337;
const TILE_PINK_WALL_2 = 338;
const TILE_PINK_WALL_3 = 339;
const TILE_PINK_WALL_4 = 340;
const TILE_PINK_WALL_5 = 341;
const TILE_PINK_WALL_6 = 342;
const TILE_DARK_WALL_1 = 401;
const TILE_DARK_WALL_2 = 402;
const TILE_DARK_WALL_3 = 403;
const TILE_DARK_WALL_4 = 404;
const TILE_DARK_WALL_5 = 405;
const TILE_DARK_WALL_6 = 406;
const TILE_STEEL_FLOOR_1 = 593;
const TILE_STEEL_FLOOR_2 = 594;
const TILE_STEEL_FLOOR_3 = 595;
const TILE_STEEL_FLOOR_4 = 596;
const TILE_STEEL_FLOOR_5 = 597;
const TILE_STEEL_FLOOR_6 = 598;
const TILE_STEEL_FLOOR_7 = 599;
const TILE_STEEL_FLOOR_8 = 600;

const SECTOR_DEFINITIONS = [
    {
        // 0: Sector 1
        roomCount: 10,
        roomMinWidth: 5,
        roomMaxWidth: 12,
        roomMinHeight: 5,
        roomMaxHeight: 8,
        floorTiles: [
            [TILE_STEEL_FLOOR_1, 0.33],
            [TILE_STEEL_FLOOR_2, 0.33],
            [TILE_STEEL_FLOOR_3, 0.33],
        ],
        wallTiles: [
            [TILE_GRAY_WALL_1, 0.6],
            [TILE_GRAY_WALL_2, 0.1],
            [TILE_GRAY_WALL_3, 0.1],
            [TILE_GRAY_WALL_4, 0.1],
            [TILE_GRAY_WALL_6, 0.1],
        ],
        entitityTypes: [
            [ENTITY_TYPE_SPIDER, 1.0]
        ]
    },
    {
        // 1: Sector 2
        roomCount: 10,
        roomMinWidth: 5,
        roomMaxWidth: 12,
        roomMinHeight: 5,
        roomMaxHeight: 8,
        floorTiles: [
            [TILE_STEEL_FLOOR_1, 0.33],
            [TILE_STEEL_FLOOR_2, 0.33],
            [TILE_STEEL_FLOOR_3, 0.33],
        ],
        wallTiles: [
            [TILE_GRAY_WALL_1, 0.1],
            [TILE_GRAY_WALL_2, 0.1],
            [TILE_GRAY_WALL_3, 0.1],
            [TILE_GRAY_WALL_4, 0.1],
            [TILE_GRAY_WALL_6, 0.1],
            [TILE_ORANGE_WALL_1, 0.1],
            [TILE_ORANGE_WALL_2, 0.1],
            [TILE_ORANGE_WALL_3, 0.1],
            [TILE_ORANGE_WALL_4, 0.1],
            [TILE_ORANGE_WALL_6, 0.1],
        ],
        entitityTypes: [
            [ENTITY_TYPE_SPIDER, 0.5],
            [ENTITY_TYPE_HATCHER, 0.5],
        ]
    },
    {
        // 2: Sector 3
        roomCount: 10,
        roomMinWidth: 5,
        roomMaxWidth: 12,
        roomMinHeight: 5,
        roomMaxHeight: 8,
        floorTiles: [
            [TILE_STEEL_FLOOR_1, 0.33],
            [TILE_STEEL_FLOOR_2, 0.33],
            [TILE_STEEL_FLOOR_3, 0.33],
        ],
        wallTiles: [
            [TILE_GRAY_WALL_1, 0.1],
            [TILE_GRAY_WALL_2, 0.1],
            [TILE_GRAY_WALL_3, 0.1],
            [TILE_GRAY_WALL_4, 0.1],
            [TILE_GRAY_WALL_6, 0.1],
            [TILE_ORANGE_WALL_1, 0.1],
            [TILE_ORANGE_WALL_2, 0.1],
            [TILE_ORANGE_WALL_3, 0.1],
            [TILE_ORANGE_WALL_4, 0.1],
            [TILE_ORANGE_WALL_6, 0.1],
        ],
        entitityTypes: [
            [ENTITY_TYPE_SPIDER, 0.333],
            [ENTITY_TYPE_HATCHER, 0.333],
            [ENTITY_TYPE_SLIMER, 0.333],
        ]
    },
    {
        // 3: Sector 4
        roomCount: 10,
        roomMinWidth: 5,
        roomMaxWidth: 12,
        roomMinHeight: 5,
        roomMaxHeight: 8,
        floorTiles: [
            [TILE_STEEL_FLOOR_1, 0.33],
            [TILE_STEEL_FLOOR_2, 0.33],
            [TILE_STEEL_FLOOR_3, 0.33],
        ],
        wallTiles: [
            [TILE_GRAY_WALL_1, 0.1],
            [TILE_GRAY_WALL_2, 0.1],
            [TILE_GRAY_WALL_3, 0.1],
            [TILE_GRAY_WALL_4, 0.1],
            [TILE_GRAY_WALL_6, 0.1],
            [TILE_ORANGE_WALL_1, 0.1],
            [TILE_ORANGE_WALL_2, 0.1],
            [TILE_ORANGE_WALL_3, 0.1],
            [TILE_ORANGE_WALL_4, 0.1],
            [TILE_ORANGE_WALL_6, 0.1],
        ],
        entitityTypes: [
            [ENTITY_TYPE_SPIDER, 0.333],
            [ENTITY_TYPE_HATCHER, 0.333],
            [ENTITY_TYPE_SLIMER, 0.333],
        ]
    },
    {
        // 4: Sector 5
        roomCount: 10,
        roomMinWidth: 5,
        roomMaxWidth: 12,
        roomMinHeight: 5,
        roomMaxHeight: 8,
        floorTiles: [
            [TILE_STEEL_FLOOR_1, 0.33],
            [TILE_STEEL_FLOOR_2, 0.33],
            [TILE_STEEL_FLOOR_3, 0.33],
        ],
        wallTiles: [
            [TILE_GRAY_WALL_1, 0.6],
            [TILE_GRAY_WALL_2, 0.1],
            [TILE_GRAY_WALL_3, 0.1],
            [TILE_GRAY_WALL_4, 0.1],
            [TILE_GRAY_WALL_6, 0.1],
        ],
        entitityTypes: [
            [ENTITY_TYPE_SPIDER, 0.333],
            [ENTITY_TYPE_HATCHER, 0.333],
            [ENTITY_TYPE_SLIMER, 0.333],
        ]
    },
    {
        // 5: Sector 6
        roomCount: 10,
        roomMinWidth: 5,
        roomMaxWidth: 12,
        roomMinHeight: 5,
        roomMaxHeight: 8,
        floorTiles: [
            [TILE_STEEL_FLOOR_1, 0.33],
            [TILE_STEEL_FLOOR_2, 0.33],
            [TILE_STEEL_FLOOR_3, 0.33],
        ],
        wallTiles: [
            [TILE_GRAY_WALL_1, 0.1],
            [TILE_GRAY_WALL_2, 0.1],
            [TILE_GRAY_WALL_3, 0.1],
            [TILE_GRAY_WALL_4, 0.1],
            [TILE_GRAY_WALL_6, 0.1],
            [TILE_ORANGE_WALL_1, 0.1],
            [TILE_ORANGE_WALL_2, 0.1],
            [TILE_ORANGE_WALL_3, 0.1],
            [TILE_ORANGE_WALL_4, 0.1],
            [TILE_ORANGE_WALL_6, 0.1],
        ],
        entitityTypes: [
            [ENTITY_TYPE_SPIDER, 0.333],
            [ENTITY_TYPE_HATCHER, 0.333],
            [ENTITY_TYPE_SLIMER, 0.333],
        ]
    },
    {
        // 6: Sector 7
        roomCount: 10,
        roomMinWidth: 5,
        roomMaxWidth: 12,
        roomMinHeight: 5,
        roomMaxHeight: 8,
        floorTiles: [
            [TILE_STEEL_FLOOR_1, 0.33],
            [TILE_STEEL_FLOOR_2, 0.33],
            [TILE_STEEL_FLOOR_3, 0.33],
        ],
        wallTiles: [
            [TILE_GRAY_WALL_1, 0.6],
            [TILE_GRAY_WALL_2, 0.1],
            [TILE_GRAY_WALL_3, 0.1],
            [TILE_GRAY_WALL_4, 0.1],
            [TILE_GRAY_WALL_6, 0.1],
        ],
        entitityTypes: [
            [ENTITY_TYPE_SPIDER, 0.333],
            [ENTITY_TYPE_HATCHER, 0.333],
            [ENTITY_TYPE_SLIMER, 0.333],
        ]
    },
    {
        // 7: Sector 8
        roomCount: 10,
        roomMinWidth: 5,
        roomMaxWidth: 12,
        roomMinHeight: 5,
        roomMaxHeight: 8,
        floorTiles: [
            [TILE_STEEL_FLOOR_1, 0.33],
            [TILE_STEEL_FLOOR_2, 0.33],
            [TILE_STEEL_FLOOR_3, 0.33],
        ],
        wallTiles: [
            [TILE_GRAY_WALL_1, 0.1],
            [TILE_GRAY_WALL_2, 0.1],
            [TILE_GRAY_WALL_3, 0.1],
            [TILE_GRAY_WALL_4, 0.1],
            [TILE_GRAY_WALL_6, 0.1],
            [TILE_ORANGE_WALL_1, 0.1],
            [TILE_ORANGE_WALL_2, 0.1],
            [TILE_ORANGE_WALL_3, 0.1],
            [TILE_ORANGE_WALL_4, 0.1],
            [TILE_ORANGE_WALL_6, 0.1],
        ],
        entitityTypes: [
            [ENTITY_TYPE_SPIDER, 0.333],
            [ENTITY_TYPE_HATCHER, 0.333],
            [ENTITY_TYPE_SLIMER, 0.333],
        ]
    },
    {
        // 8: Sector 9
        roomCount: 10,
        roomMinWidth: 5,
        roomMaxWidth: 12,
        roomMinHeight: 5,
        roomMaxHeight: 8,
        floorTiles: [
            [TILE_STEEL_FLOOR_1, 0.33],
            [TILE_STEEL_FLOOR_2, 0.33],
            [TILE_STEEL_FLOOR_3, 0.33],
        ],
        wallTiles: [
            [TILE_GRAY_WALL_1, 0.6],
            [TILE_GRAY_WALL_2, 0.1],
            [TILE_GRAY_WALL_3, 0.1],
            [TILE_GRAY_WALL_4, 0.1],
            [TILE_GRAY_WALL_6, 0.1],
        ],
        entitityTypes: [
            [ENTITY_TYPE_SPIDER, 0.333],
            [ENTITY_TYPE_HATCHER, 0.333],
            [ENTITY_TYPE_SLIMER, 0.333],
        ]
    },
    {
        // 9: Sector 10
        roomCount: 5,
        roomMinWidth: 10,
        roomMaxWidth: 12,
        roomMinHeight: 8,
        roomMaxHeight: 8,
        floorTiles: [
            [TILE_STEEL_FLOOR_1, 0.33],
            [TILE_STEEL_FLOOR_2, 0.33],
            [TILE_STEEL_FLOOR_3, 0.33],
        ],
        wallTiles: [
            [TILE_GRAY_WALL_1, 0.1],
            [TILE_GRAY_WALL_2, 0.1],
            [TILE_GRAY_WALL_3, 0.1],
            [TILE_GRAY_WALL_4, 0.1],
            [TILE_GRAY_WALL_6, 0.1],
            [TILE_ORANGE_WALL_1, 0.1],
            [TILE_ORANGE_WALL_2, 0.1],
            [TILE_ORANGE_WALL_3, 0.1],
            [TILE_ORANGE_WALL_4, 0.1],
            [TILE_ORANGE_WALL_6, 0.1],
        ],
        entitityTypes: [
            [ENTITY_TYPE_SPIDER, 0.333],
            [ENTITY_TYPE_HATCHER, 0.333],
            [ENTITY_TYPE_SLIMER, 0.333],
        ]
    },
];

let map = null;
let sectors = null;
let sectorGrid = null;
let sectorParents = null;

function initMap() {
    map = new wglt.TileMap(MAP_WIDTH, MAP_HEIGHT, MAP_LAYERS);
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

        sector.rect = new wglt.Rect(
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
            if (j < 3 && s.children.length > 0) {
                // Sectors 1-3 can have max of 1 child
                s.childrenSlots = 0;
            }
            if (s.childrenSlots > 0) {
                sectorParents.push(s);
            }
        }
    }

    for (let j = 0; j < sectors.length; j++) {
        const sectorDef = SECTOR_DEFINITIONS[0];
        const sector = sectors[j];
        const rooms = sector.rooms;

        // Always add 4 rooms on the cardinal directions
        const westRoom = new wglt.Rect(sector.rect.x1 + 1, sector.rect.getCenter().y - 2, 5, 5);
        createRoom(westRoom);
        rooms.push(westRoom);

        const eastRoom = new wglt.Rect(sector.rect.x2 - 5, sector.rect.getCenter().y - 2, 5, 5);
        createRoom(eastRoom);
        rooms.push(eastRoom);

        const northRoom = new wglt.Rect(sector.rect.getCenter().x - 2, sector.rect.y1 + 1, 5, 5);
        createRoom(northRoom);
        rooms.push(northRoom);

        const southRoom = new wglt.Rect(sector.rect.getCenter().x - 2, sector.rect.y2 - 5, 5, 5);
        createRoom(southRoom);
        rooms.push(southRoom);

        while (rooms.length < sectorDef.roomCount) {
            const w = chooseBetween(sectorDef.roomMinWidth, sectorDef.roomMaxWidth);
            const h = chooseBetween(sectorDef.roomMinHeight, sectorDef.roomMaxHeight);
            const x = chooseBetween(sector.rect.x1 + 2, sector.rect.x2 - w - 3);
            const y = chooseBetween(sector.rect.y1 + 2, sector.rect.y2 - h - 3);
            const rect = new wglt.Rect(x, y, w, h);

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
                    map.setTile(0, x, y, getHalfWallTile(x, y), true);
                } else if (map.getTile(x, y) !== TILE_EMPTY && map.getTile(x, y + 1) === TILE_EMPTY) {
                    map.setTile(0, x, y, getHalfWallTile(x, y), true);
                } else if (!map.isSolid(x, y - 1) ||
                    !map.isSolid(x - 1, y) ||
                    !map.isSolid(x + 1, y) ||
                    !map.isSolid(x - 1, y - 1) ||
                    !map.isSolid(x + 1, y - 1) ||
                    !map.isSolid(x - 1, y + 1) ||
                    !map.isSolid(x + 1, y + 1)) {
                    map.setTile(0, x, y, getWallTile(x, y), true);
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
            map.setTile(0, x, y, getFloorTile(x, y), false);
        }
    }
}

function createHTunnel(x1, x2, y) {
    for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
        map.setTile(0, x, y, getFloorTile(x, y), false);
    }
}

function createVTunnel(y1, y2, x) {
    for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
        map.setTile(0, x, y, getFloorTile(x, y), false);
    }
}

function chooseBetween(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

function getSectorAt(x, y) {
    const sx = (x / SECTOR_WIDTH) | 0;
    const sy = (y / SECTOR_HEIGHT) | 0;
    if (sx < 0 || sx >= 4 || sy < 0 || sy >= 4) {
        return null;
    }
    return sectorGrid[sy][sx];
}

function getSectorDef(x, y) {
    const sector = getSectorAt(x, y);
    const index = sector ? sector.level : 0;
    return SECTOR_DEFINITIONS[index % SECTOR_DEFINITIONS.length];
}

function getFloorTile(x, y) {
    return chooseFromTable(getSectorDef(x, y).floorTiles);
}

function getHalfWallTile(x, y) {
    return chooseFromTable(getSectorDef(x, y).wallTiles);
}

function getWallTile(x, y) {
    // Full wall tiles are shifted 6 tiles from half wall tiles
    // Look at sprite sheet to confirm
    return chooseFromTable(getSectorDef(x, y).wallTiles) + 6;
}

function chooseFromTable(table) {
    const r = Math.random();
    let probability = 0.0;

    for (let i = 0; i < table.length; i++) {
        probability += table[i][1];
        if (r < probability) {
            return table[i][0];
        }
    }

    return table[table.length - 1][0];
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
