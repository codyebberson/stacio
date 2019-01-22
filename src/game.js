
let canvas = null;
let gl = null;
let imageWidth = 0;
let imageHeight = 0;
let animFrame = 0;
let animDelay = 0;
let currEntityIndex = 0;
let t = 0;

let player = null;
let blaster = null;
let entities = null;
let items = null;
let inventory = null;
let messages = null;
let viewport = null;
let selectedEntity = null;

function initEntities() {
    player = {
        entityType: ENTITY_TYPE_PLAYER,
        name: 'Player',
        x: sectors[0].rooms[0].getCenter().x * TILE_SIZE,
        y: sectors[0].rooms[0].getCenter().y * TILE_SIZE,
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

    blaster = {
        entityType: ENTITY_TYPE_BLASTER,
        name: 'Blaster',
        x: player.x + 32,
        y: player.y + 32
    }

    entities = [
        player
    ];

    items = [
        blaster
    ];

    inventory = [];

    messages = [];

    viewport = {
        x: 0,
        y: 0
    };

    selectedEntity = null;

    for (let j = 0; j < sectors.length; j++) {
        const sector = sectors[j];
        const rooms = sector.rooms;
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
    }

    map.computeFov((player.x / TILE_SIZE) | 0, (player.y / TILE_SIZE) | 0, 12);
}

const effects = [];

let screenShakeCountdown = 0;

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

    initMap();
    initEntities();

    map.initGl(gl);

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
    let scale = 1.0;

    if (width > height) {
        scale = Math.max(1, Math.min(Math.floor(width / 256.0), Math.floor(height / 144.0)));
    } else {
        scale = Math.max(1, Math.min(Math.floor(width / 144.0), Math.floor(height / 256.0)));
    }

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
    let shootButton = false;

    if (mouse.down) {
        if (mouse.y > SCREEN_HEIGHT - TOOLBAR_HEIGHT) {
            // Toolbar
            if (mouse.x >= 0 && mouse.x < 32) {
                shootButton = true;
            }

        } else {
            // Get path to current location
            const mouseTileX = ((viewport.x + mouse.x) / TILE_SIZE) | 0;
            const mouseTileY = ((viewport.y + mouse.y) / TILE_SIZE) | 0;

            selectedEntity = getEntityAt(mouseTileX, mouseTileY);
            if (selectedEntity) {
                player.target = null;
                player.path = null;
                return;
            }

            const target = map.getCell(mouseTileX, mouseTileY);
            if (target !== player.target) {
                const source = { x: playerTileX, y: playerTileY };
                player.target = target;
                player.path = computePath(source, player.target, 20);
                player.pathIndex = 0;
            }
            return;
        }
    }

    if (keys[KEY_TAB].downCount === 1) {
        if (selectedEntity) {
            const selectedIndex = entities.indexOf(selectedEntity);
            let nextIndex = selectedIndex + 1;
            if (nextIndex === entities.length - 1 || !isVisible(entities[nextIndex])) {
                nextIndex = 1;
            }
            selectedEntity = entities[nextIndex];
        } else {
            selectedEntity = entities[1];
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
        if (!nextStep) {
            player.target = null;
            player.path = null;
        }
    }

    const down = keys[KEY_NUMPAD_2].down || keys[KEY_DOWN].down || (nextStep && nextStep.y > playerTileY);
    const left = keys[KEY_NUMPAD_4].down || keys[KEY_LEFT].down || (nextStep && nextStep.x < playerTileX);
    const right = keys[KEY_NUMPAD_6].down || keys[KEY_RIGHT].down || (nextStep && nextStep.x > playerTileX);
    const up = keys[KEY_NUMPAD_8].down || keys[KEY_UP].down || (nextStep && nextStep.y < playerTileY);
    const wait = keys[KEY_NUMPAD_5].down;
    const shoot = keys[KEY_1].downCount === 1 || shootButton;

    if (down) {
        tryMoveOrAttack(player, 0, player.walkSpeed, DIRECTION_DOWN);

    } else if (left) {
        tryMoveOrAttack(player, -player.walkSpeed, 0, DIRECTION_LEFT);

    } else if (wait) {
        player.ap = 0;

    } else if (right) {
        tryMoveOrAttack(player, player.walkSpeed, 0, DIRECTION_RIGHT);

    } else if (up) {
        tryMoveOrAttack(player, 0, -player.walkSpeed, DIRECTION_UP);

    } else if (shoot) {
        if (selectedEntity) {
            effects.push({
                x: selectedEntity.x,
                y: selectedEntity.y,
                frame: 0
            });
            player.animationCount = 36;
            takeDamage(player, selectedEntity, 5);
        }
    }
}

function doAi(entity) {
    if (entity.hp <= 0) {
        // Already dead
        entity.ap = 0;
        return;
    }

    if (!isVisible(entity)) {
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

function isVisible(entity) {
    return entity.x + SPRITE_WIDTH >= viewport.x &&
        entity.y + SPRITE_HEIGHT >= viewport.y &&
        entity.x < viewport.x + SCREEN_WIDTH &&
        entity.y < viewport.y + SCREEN_HEIGHT &&
        map.isVisible((entity.x / TILE_SIZE) | 0, (entity.y / TILE_SIZE) | 0);
}

function getEntityAt(x, y) {
    for (let i = 0; i < entities.length; i++) {
        const other = entities[i];
        if (other.hp <= 0) {
            // Dead, ignore
            continue;
        }
        if (((other.x / TILE_SIZE) | 0) === x && ((other.y / TILE_SIZE) | 0) === y) {
            return other;
        }
    }
    return null;
}

function tryMoveOrAttack(entity, dx, dy, direction) {
    // Always change direction
    // This is purely cosmetic
    entity.direction = direction;

    const mag = Math.hypot(dx, dy);
    const tx = Math.floor(entity.x / 16) + dx / mag;
    const ty = Math.floor(entity.y / 16) + dy / mag;
    if (map.isSolid(tx, ty)) {
        return false;
    }

    const other = getEntityAt(tx, ty);
    if (other) {
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

        if (entity === selectedEntity) {
            selectedEntity = null;
        }

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

        // Update FOV
        map.computeFov((player.x / TILE_SIZE) | 0, (player.y / TILE_SIZE) | 0, 12);
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
    updateKeys();
    updateMouse();

    if (dialogState.visible) {
        handleDialogInput();
    } else if (player.hp > 0) {
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

    if (keys[KEY_A].down) {
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
        renderDialog();
    } else {
        renderNormalMode();
    }

    drawSprites();
    t++;
}

function renderNormalMode() {
    // Draw the tile map
    map.draw(viewport.x, viewport.y, SCREEN_WIDTH, SCREEN_HEIGHT);

    if (player.target) {
        const highlightX = player.target.x * TILE_SIZE - viewport.x;
        const highlightY = player.target.y * TILE_SIZE - viewport.y;

        let tx = 640;
        let ty = 176;
        if (map.isSolid(player.target.x, player.target.y)) {
            tx = 688;
        }

        drawTexture(highlightX, highlightY, tx, ty, 16, 16);
    }

    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (!isVisible(item)) {
            continue;
        }
        const x = item.x - viewport.x;
        const y = item.y - viewport.y;
        const tx = 16 * (ENTITY_SPRITE_OFFSET_X[item.entityType]);
        const ty = 16 * (ENTITY_SPRITE_OFFSET_Y[item.entityType]);
        drawTexture(x, y, tx, ty, 16, 16);
    }

    for (let i = 0; i < entities.length; i++) {
        const entity = entities[i];
        if (!isVisible(entity)) {
            continue;
        }
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
        if (entity === selectedEntity) {
            drawTexture(x, y, 720, 176, 16, 16);
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

    let frameY = 0;
    for (let i = 0; i < entities.length; i++) {
        const entity = entities[i];
        if (entity !== player && entity.hp <= 0) {
            continue;
        }
        if (!isVisible(entity)) {
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

    const messagesY = SCREEN_HEIGHT - TOOLBAR_HEIGHT - messages.length * 8;
    for (let i = 0; i < messages.length; i++) {
        drawString(messages[i].text, 0, messagesY + i * 8, messages[i].color);
    }

    // Draw toolbar
    for (let i = 0; i < 8; i++) {
        drawTexture(i * 16, SCREEN_HEIGHT - 16, 512, 112, 16, 16);
    }
}

main();
