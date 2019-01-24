
let canvas = null;
let gl = null;
let imageWidth = 0;
let imageHeight = 0;
let animFrame = 0;
let animDelay = 0;
let currEntityIndex = 0;
let t = 0;

let player = null;
let entities = null;
let items = null;
let inventory = null;
let messages = null;
let viewport = null;
let selectedEntity = null;
let talentsOpen = false;
let cursorMode = false;
let cursor = { x: 0, y: 0, tx: 0, ty: 0 };

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
        maxHp: 100,
        ap: 1,
        animationCount: 0,
        walkSpeed: 2,
        target: null,
        path: null,
        pathIndex: 0,
        ammo: 100,
        maxAmmo: 100,
        xp: 0,
        maxXp: 10,
        level: 1,
    };

    const radio = {
        entityType: ENTITY_TYPE_RADIO,
        name: 'Radio',
        x: player.x + 32,
        y: player.y - 32
    };

    const blaster = {
        entityType: ENTITY_TYPE_BLASTER,
        name: 'Blaster',
        x: player.x + 32,
        y: player.y + 32
    };

    entities = [
        player
    ];

    items = [
        radio,
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
            const maxEnemies = ((sector.level / 3)) | 0 + 1;
            for (let k = 0; k < maxEnemies; k++) {
                const freeCoords = getClosestEmptyTile(center.x, center.y);
                if (!freeCoords) {
                    break;
                }
                entities.push({
                    entityType: ENTITY_TYPE_ALIEN,
                    level: sector.level + 1,
                    name: 'Alien (' + (sector.level + 1) + ')',
                    x: freeCoords.tx * TILE_SIZE,
                    y: freeCoords.ty * TILE_SIZE,
                    dx: 0,
                    dy: 0,
                    direction: DIRECTION_DOWN,
                    hp: 10 + 5 * sector.level,
                    maxHp: 10 + 5 * sector.level,
                    ap: 1,
                    animationCount: 0,
                    walkSpeed: 4
                });
            }

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

    startQuest(quests[4]);
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

    if (mouse.dx !== 0 || mouse.dy !== 0) {
        cursor.x = mouse.x;
        cursor.y = mouse.y;
        cursor.tx = ((viewport.x + cursor.x) / TILE_SIZE) | 0;
        cursor.ty = ((viewport.y + cursor.y) / TILE_SIZE) | 0;
    }

    if (cursorMode) {
        if (keys[KEY_NUMPAD_2].downCount === 1 || keys[KEY_DOWN].downCount === 1) {
            cursor.y += 16;
            cursor.ty++;

        } else if (keys[KEY_NUMPAD_4].downCount === 1 || keys[KEY_LEFT].downCount === 1) {
            cursor.x -= 16;
            cursor.tx--;

        } else if (keys[KEY_NUMPAD_6].downCount === 1 || keys[KEY_RIGHT].downCount === 1) {
            cursor.x += 16;
            cursor.tx++;

        } else if (keys[KEY_NUMPAD_8].downCount === 1 || keys[KEY_UP].downCount === 1) {
            cursor.y -= 16;
            cursor.ty--;

        } else if (keys[KEY_ESCAPE].downCount === 1) {
            player.target = null;
            player.path = null;
            cursorMode = false;

        } else if (keys[KEY_ENTER].downCount === 1) {
            cursorMode = false;
        }

        const target = map.getCell(cursor.tx, cursor.ty);
        if (target !== player.target) {
            const source = { x: playerTileX, y: playerTileY };
            player.target = target;
            player.path = computePath(source, player.target, 20);
            player.pathIndex = 0;
        }

        return;
    }

    if (mouse.down) {
        if (mouse.y > SCREEN_HEIGHT - TOOLBAR_HEIGHT) {
            // Toolbar
            if (mouse.x >= 0 && mouse.x < 32) {
                shootButton = true;
            }

        } else {
            // Get path to current location
            const mouseTileX = cursor.tx;
            const mouseTileY = cursor.ty;

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
        const startIndex = selectedEntity ? entities.indexOf(selectedEntity) : 0;
        let nextIndex = startIndex + 1;
        while (nextIndex === 0 ||
            nextIndex >= entities.length ||
            entities[nextIndex].hp <= 0 ||
            !isVisible(entities[nextIndex])) {

            nextIndex++;
            if (nextIndex >= entities.length) {
                nextIndex = 0;
            }
            if (nextIndex === startIndex) {
                nextIndex = -1;
                break;
            }
        }
        if (nextIndex > 0) {
            selectedEntity = entities[nextIndex];
        } else {
            selectedEntity = null;
        }
        return;
    }

    if (keys[KEY_ENTER].downCount === 1) {
        cursor.x = player.x - viewport.x;
        cursor.y = player.y - viewport.y;
        cursor.tx = (player.x / TILE_SIZE) | 0;
        cursor.ty = (player.y / TILE_SIZE) | 0;
        cursorMode = true;
        return;
    }

    if (keys[KEY_N].downCount === 1) {
        talentsOpen = true;
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
        if (selectedEntity && player.ammo > 0) {
            effects.push({
                x: selectedEntity.x,
                y: selectedEntity.y,
                frame: 0
            });
            player.animationCount = 36;
            takeDamage(player, selectedEntity, 5);
            player.ammo--;
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

function getClosestEmptyTile(tx0, ty0) {
    for (let r = 0; r < 20; r++) {
        for (let tx = tx0 - r; tx <= tx0 + r; tx++) {
            const ty1 = ty0 - r;
            if (!map.isSolid(tx, ty1) && getEntityAt(tx, ty1) === null) {
                return { tx: tx, ty: ty1 };
            }
            const ty2 = ty0 + r;
            if (!map.isSolid(tx, ty2) && getEntityAt(tx, ty2) === null) {
                return { tx: tx, ty: ty2 };
            }
        }
        for (let ty = ty0 - r; ty <= ty0 + r; ty++) {
            const tx1 = tx0 - r;
            if (!map.isSolid(tx1, ty) && getEntityAt(tx1, ty) === null) {
                return { tx: tx1, ty: ty };
            }
            const tx2 = tx0 + r;
            if (!map.isSolid(tx2, ty) && getEntityAt(tx2, ty) === null) {
                return { tx: tx2, ty: ty };
            }
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
            const xpGain = entity.level * 10;
            player.xp += xpGain;
            while (player.xp >= player.maxXp) {
                player.xp -= player.maxXp;
                player.maxXp *= 2;
                player.level++;
                addMessage('You are now level ' + player.level, 0x00FF00FF);
            }

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
        // Reached the end of the entities list.  Start at beginning.
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
    } else if (talentsOpen) {
        if (keys[KEY_N].downCount === 1) {
            talentsOpen = false;
        }

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

        if (talentsOpen) {
            // Draw translucent layer to darken the game
            drawTexture(0, 0, 512, 256, 144, 144, 0x00000080, SCREEN_WIDTH, SCREEN_HEIGHT);

            // Draw dialog background
            const x = ((SCREEN_WIDTH - 144) / 2) | 0;
            const y = ((SCREEN_HEIGHT - 144) / 2) | 0;
            drawTexture(x, y, 512, 256, 144, 144);

            // Strength

            // Leap
            drawTexture(x + 6 + 4, y + 5 + 4, 480, 416, 16, 16);
            drawString('2', x + 6 + 4 + 11, y + 5 + 4 + 10, 0x00FF00FF);

            // Charge
            drawTexture(x + 6 + 12 + 4, y + 5 + 24 + 4, 464, 416, 16, 16);
            drawString('0', x + 6 + 16 + 11, y + 5 + 24 + 14, 0x00FF00FF);

            // Shooter
            drawTexture(x + 6 + 12 + 4, y + 5 + 48 + 4, 624, 160, 16, 16);
            drawString('0', x + 6 + 16 + 11, y + 5 + 48 + 14, 0x00FF00FF);

            // Brawler
            drawTexture(x + 6 + 12 + 4, y + 5 + 72 + 4, 448, 416, 16, 16);
            drawString('0', x + 6 + 16 + 11, y + 5 + 72 + 14, 0x00FF00FF);

            // Tech

            // Armorsmith
            drawTexture(x + 52 + 4, y + 5 + 4, 336, 416, 16, 16);
            drawString('0', x + 52 + 4 + 11, y + 5 + 4 + 10, 0x00FF00FF);

            // Weaponsmith
            drawTexture(x + 52 + 12 + 4, y + 5 + 24 + 4, 336, 448, 16, 16);
            drawString('0', x + 52 + 16 + 11, y + 5 + 24 + 14, 0x00FF00FF);

            // Power Saver
            drawTexture(x + 52 + 12 + 4, y + 5 + 48 + 4, 272, 400, 16, 16);
            drawString('0', x + 52 + 16 + 11, y + 5 + 48 + 14, 0x00FF00FF);

            // Hacker
            drawTexture(x + 52 + 12 + 4, y + 5 + 72 + 4, 400, 432, 16, 16);
            drawString('0', x + 52 + 16 + 11, y + 5 + 72 + 14, 0x00FF00FF);

            // Psych

            // Sleeper
            drawTexture(x + 98 + 4, y + 5 + 4, 128, 354, 16, 16);
            drawString('0', x + 98 + 4 + 11, y + 5 + 4 + 10, 0x00FF00FF);

            // Push
            drawTexture(x + 98 + 12 + 4, y + 5 + 24 + 4, 592, 160, 16, 16);
            drawString('0', x + 98 + 16 + 11, y + 5 + 24 + 14, 0x00FF00FF);

            // Stealth
            drawTexture(x + 98 + 12 + 4, y + 5 + 48 + 4, 272, 400, 16, 16);
            drawString('0', x + 98 + 16 + 11, y + 5 + 48 + 14, 0x00FF00FF);

            // Blocker
            drawTexture(x + 98 + 12 + 4, y + 5 + 72 + 4, 352, 400, 16, 16);
            drawString('0', x + 98 + 16 + 11, y + 5 + 72 + 14, 0x00FF00FF);

            drawString('1: Leap 2 squares', x + 8, y + 106, 0xFFFFFFFF);
            drawString('2: Leap 3 squares', x + 8, y + 114, 0xFFFFFFFF);
            drawString('3: Leap 4 squares', x + 8, y + 122, 0x00FF00FF);
            drawString('4: Leap 5 squares', x + 8, y + 130, 0x808080FF);
        }
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

        if (entity === player) {
            const hpPercent = entity.hp / entity.maxHp;
            drawString(entity.name, 0, frameY);
            drawTexture(0, frameY + 7, 544, 208, 32, 12);
            drawTexture(2, frameY + 9, 544, 224, 8, 8, undefined, Math.round(hpPercent * 28));
            drawString(entity.hp + '/' + entity.maxHp, 0, frameY + 10);

            const ammoPercent = player.ammo / player.maxAmmo;
            drawString('AMMO', 32, frameY);
            drawTexture(32, frameY + 7, 544, 208, 32, 12);
            drawTexture(34, frameY + 9, 552, 224, 8, 8, undefined, Math.round(ammoPercent * 28));
            drawString(entity.ammo + '/' + entity.maxAmmo, 32, frameY + 10);

            const xpPercent = player.xp / player.maxXp;
            drawString('LEVEL ' + player.level, 64, frameY);
            drawTexture(64, frameY + 7, 544, 208, 32, 12);
            drawTexture(66, frameY + 9, 568, 224, 8, 8, undefined, Math.round(xpPercent * 28));
            drawString(entity.xp + '/' + entity.maxXp, 64, frameY + 10);

        } else {
            const hpPercent = entity.hp / entity.maxHp;
            drawString(entity.name, 0, frameY);
            drawTexture(0, frameY + 7, 544, 208, 32, 12);
            drawTexture(2, frameY + 9, 560, 224, 8, 8, undefined, Math.round(hpPercent * 28));
            drawString(entity.hp + '/' + entity.maxHp, 0, frameY + 10);
        }

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
    for (let i = 0; i < 6; i++) {
        // Draw button background
        drawTexture(
            i * TOOLBAR_BUTTON_SIZE,
            SCREEN_HEIGHT - TOOLBAR_BUTTON_SIZE,
            512, 208,
            TOOLBAR_BUTTON_SIZE, TOOLBAR_BUTTON_SIZE);

        if (i === 0) {
            // Draw button
            // TODO: generalize
            drawTexture(
                i * TOOLBAR_BUTTON_SIZE + 4,
                SCREEN_HEIGHT - TOOLBAR_BUTTON_SIZE + 4,
                256, 448,
                16, 16);
        }
    }
}

main();
