
const SCREEN_WIDTH = 256;
const SCREEN_HEIGHT = 144;
const SCREEN_ASPECT_RATIO = SCREEN_WIDTH / SCREEN_HEIGHT;

const TILE_SIZE = 16;
const TEXTURE_SIZE = 1024;

const KEY_SPACE = 32;
const KEY_LEFT = 37;
const KEY_UP = 38;
const KEY_RIGHT = 39;
const KEY_DOWN = 40;
const KEY_1 = 49;
const KEY_2 = 50;
const KEY_A = 65;
const KEY_X = 88;
const KEY_Z = 90;
const KEY_NUMPAD_0 = 96;
const KEY_NUMPAD_1 = 97;
const KEY_NUMPAD_2 = 98;
const KEY_NUMPAD_3 = 99;
const KEY_NUMPAD_4 = 100;
const KEY_NUMPAD_5 = 101;
const KEY_NUMPAD_6 = 102;
const KEY_NUMPAD_7 = 103;
const KEY_NUMPAD_8 = 104;
const KEY_NUMPAD_9 = 105;

const DIRECTION_UP = 0;
const DIRECTION_RIGHT = 1;
const DIRECTION_DOWN = 2;
const DIRECTION_LEFT = 3;

const SPRITE_WIDTH = 16;
const SPRITE_HEIGHT = 16;

const WALK_COUNT = 8;
const WALK_SPEED = TILE_SIZE / WALK_COUNT;

const ATTACK_COUNT = 18;

const ENTITY_TYPE_PLAYER = 0;
const ENTITY_TYPE_ALIEN = 1;
const ENTITY_TYPE_BLASTER = 2;
const ENTITY_TYPE_BLUE_KEYCARD = 3;

const ENTITY_SPRITE_OFFSET_X = [0, 0, 16, 17];
const ENTITY_SPRITE_OFFSET_Y = [1, 5, 28, 23];
const DIRECTION_OFFSET_X = [2, 0, 1, 3];