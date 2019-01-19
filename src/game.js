
let canvas = null;
let gl = null;
let imageWidth = 0;
let imageHeight = 0;
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
    animationCount: 0,
    walkSpeed: 2,
    target: null,
    path: null,
    pathIndex: 0
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
        animationCount: 0,
        walkSpeed: 4
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

let tileMap = null;

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
        tileMap.layers.push(new TileMapLayer(gl, map.layers[i], MAP_WIDTH, MAP_HEIGHT));
    }

    window.addEventListener('resize', handleResizeEvent, false);
    handleResizeEvent();

    initMouse(canvas);

    requestAnimationFrame(update);
}

/**
 * Handles window resize events.
 * Updates canvas size.
 */
function handleResizeEvent() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const scale = Math.max(1, Math.min(Math.floor(width / 160.0), Math.floor(height / 160.0)));

    SCREEN_WIDTH = Math.round(width / scale);
    SCREEN_HEIGHT = Math.round(height / scale);
    SCREEN_ASPECT_RATIO = SCREEN_WIDTH / SCREEN_HEIGHT;

    canvas.width = SCREEN_WIDTH;
    canvas.height = SCREEN_HEIGHT;
    canvas.style.left = '0';
    canvas.style.top = '0';
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
}

function handlePlayerInput() {
    if (player.hp <= 0) {
        player.ap = 0;
        return;
    }

    const playerTileX = (player.x / TILE_SIZE) | 0;
    const playerTileY = (player.y / TILE_SIZE) | 0;

    if (mouse.down) {
        // Get path to current location
        const mouseTileX = ((viewport.x + mouse.x) / TILE_SIZE) | 0;
        const mouseTileY = ((viewport.y + mouse.y) / TILE_SIZE) | 0;
        const target = getCell(mouseTileX, mouseTileY);
        if (target !== player.target) {
            const source = { x: playerTileX, y: playerTileY };
            player.target = target;
            player.path = computePath(source, player.target, 20);
            player.pathIndex = 0;
        }
        return;
    }

    let nextStep = null;
    if (player.path) {
        nextStep = player.path[player.pathIndex];
        while (nextStep && nextStep.x === playerTileX && nextStep.y === playerTileY) {
            player.pathIndex++;
            nextStep = player.pathIndex < player.path.length ? player.path[player.pathIndex] : null;
        }
    }

    const down = keys[KEY_NUMPAD_2] || keys[KEY_DOWN] || (nextStep && nextStep.y > playerTileY);
    const left = keys[KEY_NUMPAD_4] || keys[KEY_LEFT] || (nextStep && nextStep.x < playerTileX);
    const right = keys[KEY_NUMPAD_6] || keys[KEY_RIGHT] || (nextStep && nextStep.x > playerTileX);
    const up = keys[KEY_NUMPAD_8] || keys[KEY_UP] || (nextStep && nextStep.y < playerTileY);

    if (down) {
        tryMoveOrAttack(player, 0, player.walkSpeed, DIRECTION_DOWN);

    } else if (left) {
        tryMoveOrAttack(player, -player.walkSpeed, 0, DIRECTION_LEFT);

    } else if (keys[KEY_NUMPAD_5]) {
        player.ap = 0;

    } else if (right) {
        tryMoveOrAttack(player, player.walkSpeed, 0, DIRECTION_RIGHT);

    } else if (up) {
        tryMoveOrAttack(player, 0, -player.walkSpeed, DIRECTION_UP);

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

    if (Math.abs(entity.x - player.x) > 144 || Math.abs(entity.y - player.y) > 96) {
        // Too far away
        entity.ap = 0;
        return;
    }

    if (player.x < entity.x && tryMoveOrAttack(entity, -entity.walkSpeed, 0, DIRECTION_LEFT)) {
        return;
    }

    if (player.x > entity.x && tryMoveOrAttack(entity, entity.walkSpeed, 0, DIRECTION_RIGHT)) {
        return;
    }

    if (player.y < entity.y && tryMoveOrAttack(entity, 0, -entity.walkSpeed, DIRECTION_UP)) {
        return;
    }

    if (player.y > entity.y && tryMoveOrAttack(entity, 0, entity.walkSpeed, DIRECTION_DOWN)) {
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

    const mag = Math.hypot(dx, dy);
    const tx = Math.floor(entity.x / 16) + dx / mag;
    const ty = Math.floor(entity.y / 16) + dy / mag;
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
    entity.animationCount = TILE_SIZE / Math.max(Math.abs(dx), Math.abs(dy));
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
            if (entities[i].hp > 0) {
                entities[i].ap = 1;
            }
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
        showDialog(option.nextDialogIndex);
    } else if (option.actionType === 'quest') {
        hideDialog();
        startQuest(quests[option.questIndex]);
    } else {
        hideDialog();
    }
}

function update() {
    updateMouse();

    if (dialogState.visible) {
        handleDialogInput();
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

    viewport.x = Math.max(0, player.x - ((SCREEN_WIDTH / 2) | 0) + 8);
    viewport.y = Math.max(0, player.y - ((SCREEN_HEIGHT / 2) | 0) + 8);

    if (screenShakeCountdown-- > 0) {
        viewport.x += 4 * Math.random() - 2;
        viewport.y += 4 * Math.random() - 2;
    }

    // Reset sprite index buffers
    positionArrayIndex = 0;
    texcoordArrayIndex = 0;
    colorArrayIndex = 0;

    if (dialogState.visible) {
        // // Tell it to use our program (pair of shaders)
        // gl.useProgram(program);
        renderDialog();
    } else {
        renderNormalMode();
    }

    drawSprites();
    t++;
}

function renderNormalMode() {
    // Draw the tile map
    tileMap.draw(viewport.x, viewport.y);

    // // Tell it to use our program (pair of shaders)
    // gl.useProgram(program);

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

    if (mouse.down) {
        drawTexture(mouse.x - 7, mouse.y - 7, 624, 144, 16, 16);

        const mouseTileX = ((viewport.x + mouse.x) / TILE_SIZE) | 0;
        const mouseTileY = ((viewport.y + mouse.y) / TILE_SIZE) | 0;

        const highlightX = mouseTileX * TILE_SIZE - viewport.x;
        const highlightY = mouseTileY * TILE_SIZE - viewport.y;

        let tx = 640;
        let ty = 176;
        if (isSolid(mouseTileX, mouseTileY)) {
            tx = 688;
        }

        drawTexture(highlightX, highlightY, tx, ty, 16, 16);
    }

    let frameY = 0;
    for (let i = 0; i < entities.length; i++) {
        const entity = entities[i];
        if (entity !== player && entity.hp <= 0) {
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
        drawString('OBJECTIVES:', SCREEN_WIDTH - 60, 0);
        for (let i = 0; i < questLog.length; i++) {
            drawString(questLog[i].title, SCREEN_WIDTH - 60, 8 + 8 * i);
        }
    }

    const messagesY = SCREEN_HEIGHT - messages.length * 8;
    for (let i = 0; i < messages.length; i++) {
        drawString(messages[i].text, 0, messagesY + i * 8, messages[i].color);
    }
}

main();
