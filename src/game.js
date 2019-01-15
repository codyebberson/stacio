
var canvas = null;
var gl = null;
var imageWidth = 0;
var imageHeight = 0;
let animFrame = 0;
let animDelay = 0;
let currEntityIndex = 0;
let t = 0;

const player = {
    entityType: ENTITY_TYPE_PLAYER,
    name: 'Player',
    x: rooms[0].getCenter().x * TILE_SIZE,
    y: rooms[0].getCenter().y * TILE_SIZE,
    dx: 0,
    dy: 0,
    direction: DIRECTION_DOWN,
    hp: 100,
    ap: 1,
    animationCount: 0
};

const blaster = {
    entityType: ENTITY_TYPE_BLASTER,
    name: 'Blaster',
    x: player.x + 32,
    y: player.y + 32
}

const entities = [
    player
];

const items = [
    blaster
];

const inventory = [];

const messages = [];

const viewport = {
    x: 0,
    y: 0
};

for (let i = 1; i < rooms.length; i++) {
    const center = rooms[i].getCenter();
    entities.push({
        entityType: ENTITY_TYPE_ALIEN,
        name: 'Alien',
        x: center.x * TILE_SIZE,
        y: center.y * TILE_SIZE,
        dx: 0,
        dy: 0,
        direction: DIRECTION_DOWN,
        hp: 10,
        ap: 1,
        animationCount: 0
    });

    if (i === 8) {
        items.push({
            entityType: ENTITY_TYPE_BLUE_KEYCARD,
            name: 'Blue Key',
            x: center.x * TILE_SIZE + 32,
            y: center.y * TILE_SIZE + 32
        });
    }
}

const effects = [];

let screenShakeCountdown = 0;

var tileMap = null;

function main() {
    let canvases = document.querySelectorAll('canvas');
    canvas = canvases[0];
    gl = canvas.getContext("webgl", { alpha: false, antialias: false });
    if (!gl) {
        return;
    }

    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    initSprites();

    spriteTexture = createTexture('img/graphics.png');

    tileMap = new TileMap(gl);
    tileMap.spriteSheet = spriteTexture;

    for (let i = 0; i < MAP_LAYERS; i++) {
        tileMap.layers.push(new TileMapLayer(gl, mapLayers[i], MAP_WIDTH, MAP_HEIGHT));
    }

    window.addEventListener('resize', handleResizeEvent, false);
    handleResizeEvent();

    canvas.addEventListener('touchend', handleTouches, { passive: true });

    requestAnimationFrame(update);
}

/**
 * Handles window resize events.
 * Updates canvas size.
 */
function handleResizeEvent() {
    let width = window.innerWidth;
    let height = window.innerHeight;

    let ratio = width / height;
    let scale = 1.0;

    if (ratio > 16.0 / 9.0) {
        // Wider
        scale = height / 144.0;
    } else {
        // Taller
        scale = width / 256.0;
    }

    canvas.style.left = '0';
    canvas.style.top = '0';
    canvas.style.width = Math.floor(scale * 256.0) + 'px';
    canvas.style.height = Math.floor(scale * 144.0) + 'px';
}

function handleTouches(e) {
    e.preventDefault();

    if (!document.fullscreenElement) {
        canvas.requestFullscreen();
        return;
    }
}

function handlePlayerInput() {
    if (keys[KEY_NUMPAD_1]) {
        tryMoveOrAttack(player, -WALK_SPEED, WALK_SPEED, DIRECTION_LEFT);

    } else if (keys[KEY_NUMPAD_2] || keys[KEY_DOWN]) {
        tryMoveOrAttack(player, 0, WALK_SPEED, DIRECTION_DOWN);

    } else if (keys[KEY_NUMPAD_3]) {
        tryMoveOrAttack(player, WALK_SPEED, WALK_SPEED, DIRECTION_RIGHT);

    } else if (keys[KEY_NUMPAD_4] || keys[KEY_LEFT]) {
        tryMoveOrAttack(player, -WALK_SPEED, 0, DIRECTION_LEFT);

    } else if (keys[KEY_NUMPAD_5]) {
        player.ap = 0;

    } else if (keys[KEY_NUMPAD_6] || keys[KEY_RIGHT]) {
        tryMoveOrAttack(player, WALK_SPEED, 0, DIRECTION_RIGHT);

    } else if (keys[KEY_NUMPAD_7]) {
        tryMoveOrAttack(player, -WALK_SPEED, -WALK_SPEED, DIRECTION_LEFT);

    } else if (keys[KEY_NUMPAD_8] || keys[KEY_UP]) {
        tryMoveOrAttack(player, 0, -WALK_SPEED, DIRECTION_UP);

    } else if (keys[KEY_NUMPAD_9]) {
        tryMoveOrAttack(player, WALK_SPEED, -WALK_SPEED, DIRECTION_RIGHT);

    } else if (keys[KEY_Z]) {
        effects.push({
            x: entities[1].x,
            y: entities[1].y,
            frame: 0
        });
        player.animationCount = 36;
    }
}

function doAi(entity) {
    if (entity.hp <= 0) {
        // Already dead
        entity.ap = 0;
        return;
    }

    // if (Math.hypot(entity.x - player.x, entity.y - player.y) > 256) {
    //     // Too far away
    //     entity.ap = 0;
    //     return;
    // }

    if (Math.abs(entity.x - player.x) > 144 || Math.abs(entity.y - player.y) > 96) {
        // Too far away
        entity.ap = 0;
        return;
    }

    if (player.x < entity.x && tryMoveOrAttack(entity, -WALK_SPEED, 0, DIRECTION_LEFT)) {
        return;
    }

    if (player.x > entity.x && tryMoveOrAttack(entity, WALK_SPEED, 0, DIRECTION_RIGHT)) {
        return;
    }

    if (player.y < entity.y && tryMoveOrAttack(entity, 0, -WALK_SPEED, DIRECTION_UP)) {
        return;
    }

    if (player.y > entity.y && tryMoveOrAttack(entity, 0, WALK_SPEED, DIRECTION_DOWN)) {
        return;
    }

    // If entity is stuck, skip turn
    if (entity.dx === 0 && entity.dy === 0) {
        entity.ap = 0;
    }
}

function tryMoveOrAttack(entity, dx, dy, direction) {
    // Always change direction
    // This is purely cosmetic
    entity.direction = direction;

    const tx = Math.floor(entity.x / 16) + dx / WALK_SPEED;
    const ty = Math.floor(entity.y / 16) + dy / WALK_SPEED;
    if (isSolid(tx, ty)) {
        return false;
    }

    for (let i = 0; i < entities.length; i++) {
        const other = entities[i];
        if (other.hp <= 0) {
            // Dead, ignore
            continue;
        }
        if (Math.floor(other.x / 16) === tx && Math.floor(other.y / 16) === ty) {
            if (entity.entityType === other.entityType) {
                // Same team
                return false;
            } else {
                // Different teams, attacking
                takeDamage(entity, other, 2);
                entity.animationCount = ATTACK_COUNT;
                effects.push({
                    x: other.x,
                    y: other.y,
                    frame: 0
                });
                return true;
            }
        }
    }

    entity.dx = dx;
    entity.dy = dy;
    entity.animationCount = WALK_COUNT;
    return true;
}

function takeDamage(attacker, entity, damage) {
    entity.hp -= damage;
    if (entity.hp <= 0) {
        entity.hp = 0;
        addMessage(entity.name + ' died', 0xFF0000FF);

        if (attacker.entityType === ENTITY_TYPE_PLAYER) {
            for (let i = questLog.length - 1; i >= 0; i--) {
                const quest = questLog[i];
                if (quest.objectiveType === 'kill' && quest.entityType === entity.entityType) {
                    questLog.splice(i, 1);
                    finishQuest(quest);
                }
            }
        }
    }
}

function endMove(entity) {
    entity.dx = 0;
    entity.dy = 0;
    entity.ap--;

    if (entity.entityType === ENTITY_TYPE_PLAYER) {
        for (let i = items.length - 1; i >= 0; i--) {
            const item = items[i];
            if (item.x === entity.x && item.y === entity.y) {
                // Pick up item
                items.splice(i, 1);
                pickUpItem(item);
            }
        }
    }
}

function pickUpItem(item) {
    inventory.push(item);
    addMessage('Picked up: ' + item.name, 0x00FFFFFF);

    for (let i = questLog.length - 1; i >= 0; i--) {
        const quest = questLog[i];
        if (quest.objectiveType === 'item' && quest.entityType === item.entityType) {
            questLog.splice(i, 1);
            finishQuest(quest);
        }
    }
}

function addMessage(msg, color) {
    messages.push({
        text: msg,
        color: color
    });
    if (messages.length > 5) {
        messages.splice(0, messages.length - 5);
    }
}

function nextTurn() {
    if (currEntityIndex === 0) {
        // Sort entities by distance from player
        entities.sort(function (a, b) {
            const ad = Math.hypot(a.x - player.x, a.y - player.y);
            const bd = Math.hypot(b.x - player.x, b.y - player.y);
            return ad - bd;
        });
    }
    currEntityIndex++;
    if (currEntityIndex >= entities.length) {
        currEntityIndex = 0;
        for (let i = 0; i < entities.length; i++) {
            entities[i].ap = 1;
        }
    }
}

function tryDialogOption(index) {
    if (!dialogState.visible) {
        return;
    }

    const dialog = dialogs[dialogState.index];
    if (index < 0 || index > dialog.options.length) {
        return;
    }

    const option = dialog.options[index];
    if (option.actionType === 'dialog') {
        // dialogState.visible = true;
        // dialogState.index = option.nextDialogIndex;
        // dialogState.startTime = t;
        // dialogState.skip = false;
        showDialog(option.nextDialogIndex);
    } else if (option.actionType === 'quest') {
        // dialogState.visible = false;
        hideDialog();
        startQuest(quests[option.questIndex]);
    } else {
        // dialogState.visible = false;
        hideDialog();
    }
}

function update() {
    if (dialogState.visible) {
        if (t - dialogState.startTime > 60) {
            if (keys[KEY_SPACE]) {
                dialogState.skip = true;
            } else if (keys[KEY_1]) {
                tryDialogOption(0);
            } else if (keys[KEY_2]) {
                tryDialogOption(1);
            }
        }

    } else {
        while (true) {
            const currEntity = entities[currEntityIndex];
            if (currEntity.ap > 0 && currEntity.animationCount === 0) {
                if (currEntityIndex === 0) {
                    handlePlayerInput();
                } else {
                    doAi(currEntity);
                }
            }
            if (currEntity.animationCount > 0) {
                if (currEntity.dx !== 0 || currEntity.dy !== 0) {
                    // Moving
                    currEntity.x += currEntity.dx;
                    currEntity.y += currEntity.dy;
                }
                currEntity.animationCount--;
                if (currEntity.animationCount === 0) {
                    // currEntity.dx = 0;
                    // currEntity.dy = 0;
                    // currEntity.ap--;
                    endMove(currEntity);
                }
            }
            if (currEntity.ap <= 0) {
                currEntity.ap = 0;
                nextTurn();
            }
            if (currEntityIndex === 0 && currEntity.ap > 0) {
                // Waiting for player
                break;
            }
            if (currEntity.animationCount > 0) {
                // Waiting for animation
                break;
            }
        }
    }

    if (keys[KEY_A]) {
        screenShakeCountdown = 10;
    }

    animDelay++;
    if (animDelay > 16) {
        animDelay = 0;
        animFrame++;
    }

    render();
    requestAnimationFrame(update);
}

function render() {
    gl.viewport(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    tileMap.resizeViewport(SCREEN_WIDTH, SCREEN_HEIGHT);

    // Clear the canvas
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if (!spriteTexture || !spriteTexture.loaded) {
        return;
    }

    viewport.x = Math.max(0, player.x + 8 - 128);
    viewport.y = Math.max(0, player.y + 8 - 72);

    if (screenShakeCountdown-- > 0) {
        viewport.x += 4 * Math.random() - 2;
        viewport.y += 4 * Math.random() - 2;
    }

    // Draw the tile map
    tileMap.draw(viewport.x, viewport.y);

    // Reset sprite index buffers
    positionArrayIndex = 0;
    texcoordArrayIndex = 0;
    colorArrayIndex = 0;

    // Tell it to use our program (pair of shaders)
    gl.useProgram(program);

    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const x = item.x - viewport.x;
        const y = item.y - viewport.y;
        const tx = 16 * (ENTITY_SPRITE_OFFSET_X[item.entityType]);
        const ty = 16 * (ENTITY_SPRITE_OFFSET_Y[item.entityType]);
        drawTexture(x, y, tx, ty, 16, 16);
    }

    for (let i = 0; i < entities.length; i++) {
        const entity = entities[i];
        const x = entity.x - viewport.x;
        const y = entity.y - viewport.y;
        let tx = 0;
        let ty = 0;
        if (entity.hp <= 0) {
            tx = 496;
            ty = 432;
        } else {
            tx = 16 * (ENTITY_SPRITE_OFFSET_X[entity.entityType] + DIRECTION_OFFSET_X[entity.direction]);
            ty = 16 * (ENTITY_SPRITE_OFFSET_Y[entity.entityType] + (animFrame % 2));
        }
        drawTexture(x, y, tx, ty, 16, 16);
    }

    for (let i = effects.length - 1; i >= 0; i--) {
        const effect = effects[i];
        const x = effect.x - viewport.x;
        const y = effect.y - viewport.y;
        const frame = Math.floor(effect.frame / 6);
        const tx = 128 + 16 * frame;
        const ty = 304;
        drawTexture(x, y, tx, ty, 16, 16);
        effect.frame++;
        if (effect.frame >= 18) {
            effects.splice(i, 1);
        }
    }

    renderDialog();

    let frameY = 0;
    for (let i = 0; i < entities.length; i++) {
        const entity = entities[i];
        if (entity.hp <= 0) {
            continue;
        }
        if (Math.abs(entity.x - player.x) > 144 || Math.abs(entity.y - player.y) > 96) {
            continue;
        }
        drawString(entity.name, 0, frameY);
        drawString(entity.hp.toString(), 8, frameY + 8);
        frameY += 24;
    }

    if (questLog.length > 0) {
        drawString('OBJECTIVES:', 200, 32);
        for (let i = 0; i < questLog.length; i++) {
            drawString(questLog[i].title, 200, 40 + 8 * i);
        }
    }

    const messagesY = 144 - messages.length * 8;
    for (let i = 0; i < messages.length; i++) {
        drawString(messages[i].text, 0, messagesY + i * 8, messages[i].color);
    }

    drawSprites();

    t++;
}

main();
