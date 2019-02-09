
const ABILITY_TARGET_TYPE_NONE = 1;
const ABILITY_TARGET_TYPE_ENEMY = 2;
const ABILITY_TARGET_TYPE_TILE = 3;

const shootAbility = {
    targetType: ABILITY_TARGET_TYPE_ENEMY,
    minRange: 1,
    maxRange: 10,
    iconCoords: new wglt.Point(256, 448),
    onCast: function (caster, targetTile, targetEntity) {
        if (!targetEntity) {
            return;
        }
        if (caster.ammo === undefined || caster.ammo <= 0) {
            return;
        }
        caster.direction = getDirection4(caster.x, caster.y, targetEntity.x, targetEntity.y);
        takeDamage(caster, targetEntity, 5);
        addProjectile(caster.x, caster.y, targetEntity.x, targetEntity.y);
        addExplosion(targetEntity.x, targetEntity.y);
        caster.animationCount = 36;
        caster.ammo--;
    }
};

const leapAbility = {
    targetType: ABILITY_TARGET_TYPE_TILE,
    minRange: 1,
    maxRange: 10,
    iconCoords: new wglt.Point(480, 416),
    onCast: function (caster, targetTile, targetEntity) {
        if (!targetTile) {
            return;
        }
        if (!map.isVisible(targetTile.x, targetTile.y)) {
            return;
        }
        const casterTileX = (caster.x / TILE_SIZE) | 0;
        const casterTileY = (caster.y / TILE_SIZE) | 0;
        const dist = Math.hypot(casterTileX - targetTile.x, casterTileY - targetTile.y);
        if (dist > 3) {
            return;
        }
        caster.direction = getDirection4(caster.x, caster.y, targetTile.x * TILE_SIZE, targetTile.y * TILE_SIZE);
        caster.x = targetTile.x * TILE_SIZE;
        caster.y = targetTile.y * TILE_SIZE;
        caster.ap = 0;
        caster.animationCount = 1;
    }
};

const medkitAbility = {
    targetType: ABILITY_TARGET_TYPE_NONE,
    iconCoords: new wglt.Point(256, 382),
    onCast: function(caster, targetTile, targetEntity) {
        // Search for a medkit in the caster's inventory
        let found = false;
        for (let i = caster.inventory.length - 1; i >= 0; i--) {
            const item = caster.inventory[i];
            if (item.itemType === ITEM_TYPE_MEDKIT) {
                caster.inventory.splice(i, 1);
                found = true;
                break;
            }
        }

        if (!found) {
            // Caster does not have a medkit
            return;
        }

        const healthGain = 10;
        caster.hp = Math.min(caster.maxHp, caster.hp + healthGain);
        addFloatingText(caster.x + 8, caster.y - 4, '+' + healthGain, 0x00FF00FF);
    }
};

function getDirection4(startX, startY, endX, endY) {
    const dx = endX - startX;
    const dy = endY - startY;
    if (Math.abs(dx) >= Math.abs(dy)) {
        return dx < 0 ? DIRECTION_LEFT : DIRECTION_RIGHT;
    } else {
        return dy < 0 ? DIRECTION_UP : DIRECTION_DOWN;
    }
}
