
const ENTITY_TYPE_PLAYER = 0;
const ENTITY_TYPE_SCIENTIST = 1;
const ENTITY_TYPE_SPIDER = 2;
const ENTITY_TYPE_HATCHER = 3;
const ENTITY_TYPE_SLIMER = 4;
const ENTITY_TYPE_FLOATER = 5;
const ENTITY_TYPE_CLONER = 6;
const ENTITY_TYPE_ALIEN = 7;
const ENTITY_TYPE_QUEEN = 8;

const NO_DROP = -1;

const ENTITY_TYPES = [
    {
        // 0
        name: 'PLAYER',
        spriteX: 0,
        spriteY: 0
    },
    {
        // 1
        name: 'SCIENTIST',
        spriteX: 3,
        spriteY: 0
    },
    {
        // 2
        name: 'SPIDER',
        spriteX: 0,
        spriteY: 6,
        drops: [
            [NO_DROP, 0.8],
            [ITEM_TYPE_HEALTHKIT, 0.1],
            [ITEM_TYPE_AMMO, 0.1]
        ]
    },
    {
        // 3
        name: 'HATCHER',
        spriteX: 1,
        spriteY: 6
    },
    {
        // 4
        name: 'SLIMER',
        spriteX: 2,
        spriteY: 6,
        drops: [
            [NO_DROP, 0.8],
            [ITEM_TYPE_HEALTHKIT, 0.1],
            [ITEM_TYPE_AMMO, 0.1]
        ]
    },
    {
        // 5
        name: 'FLOATER',
        spriteX: 0,
        spriteY: 8,
        drops: [
            [NO_DROP, 0.5],
            [ITEM_TYPE_HEALTHKIT, 0.25],
            [ITEM_TYPE_AMMO, 0.25]
        ]
    },
    {
        // 6
        name: 'CLONER',
        spriteX: 3,
        spriteY: 8,
        drops: [
            [NO_DROP, 0.5],
            [ITEM_TYPE_HEALTHKIT, 0.25],
            [ITEM_TYPE_AMMO, 0.25]
        ]
    },
    {
        // 7
        name: 'ALIEN',
        spriteX: 0,
        spriteY: 2,
        drops: [
            [NO_DROP, 0.5],
            [ITEM_TYPE_HEALTHKIT, 0.25],
            [ITEM_TYPE_AMMO, 0.25]
        ]
    },
    {
        // 8
        name: 'QUEEN',
        spriteX: 1,
        spriteY: 2
    },
];
