
const shootAbility = {
    requiresTarget: true,
    minRange: 1,
    maxRange: 10,
    iconCoords: new wglt.Point(256, 448),
    onCast: function (caster, targetTile, targetEntity) {
        if (!targetEntity) {
            return;
        }
        takeDamage(caster, targetEntity, 5);
        addExplosion(targetEntity.x, targetEntity.y);
        caster.animationCount = 36;
        caster.ammo--;
    }
};

const leapAbility = {
    requiresTarget: true,
    minRange: 1,
    maxRange: 10,
    iconCoords: new wglt.Point(480, 416),
    onCast: function (caster, targetTile, targetEntity) {
        if (!targetTile) {
            return;
        }
        caster.x = targetTile.x * TILE_SIZE;
        caster.y = targetTile.y * TILE_SIZE;
        caster.ap = 0;
        caster.animationCount = 1;
    }
};
