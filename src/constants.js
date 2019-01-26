
const TOOLBAR_HEIGHT = 24;
const TOOLBAR_BUTTON_SIZE = 24;

const DIRECTION_UP = 0;
const DIRECTION_RIGHT = 1;
const DIRECTION_DOWN = 2;
const DIRECTION_LEFT = 3;
const DIRECTION_OFFSET_X = [2, 0, 1, 3];

const SPRITE_WIDTH = 16;
const SPRITE_HEIGHT = 16;

const ATTACK_COUNT = 18;

const ENTITY_TYPE_PLAYER = 0;
const ENTITY_TYPE_SCIENTIST = 1;
const ENTITY_TYPE_SPIDER = 2;
const ENTITY_TYPE_HATCHER = 3;
const ENTITY_TYPE_SLIMER = 4;
const ENTITY_TYPE_FLOATER = 5;
const ENTITY_TYPE_CLONER = 6;
const ENTITY_TYPE_ALIEN = 7;
const ENTITY_TYPE_QUEEN = 8;

const ENTITY_TYPE_DETAILS = [
    {name: 'PLAYER', x: 0, y: 0}, // PLAYER
    {name: 'SCIENTIST', x: 3, y: 0}, // SCIENTIST
    {name: 'SPIDER', x: 0, y: 6}, // SPIDER
    {name: 'HATCHER', x: 1, y: 6}, // HATCHER
    {name: 'SLIMER', x: 2, y: 6}, // SLIMER
    {name: 'FLOATER', x: 0, y: 8}, // FLOATER
    {name: 'CLONER', x: 3, y: 8}, // CLONER
    {name: 'ALIEN', x: 0, y: 2}, // ALIEN
    {name: 'QUEEN', x: 1, y: 2}, // QUEEN
];

const ITEM_TYPE_RADIO = 0;
const ITEM_TYPE_BLASTER = 1;
const ITEM_TYPE_BLUE_KEYCARD = 2;

const ITEM_SPRITE_OFFSETS = [
    {x: 7, y: 13}, // RADIO
    {x: 0, y: 14}, // BLASTER
    {x: 1, y: 9}, // BLUE KEYCARD
];
