
const EFFECT_TYPE_EXPLOSION = 1;
const EFFECT_TYPE_TEXT = 2;

const effects = [];

function addExplosion(x, y) {
    addEffect(EFFECT_TYPE_EXPLOSION, x, y, 18);
}

function addFloatingText(x, y, str, color) {
    addEffect(EFFECT_TYPE_TEXT, x, y, 40, str, color);
}

/**
 * Adds an effect to the effects queue.
 * @param {number} effectType
 * @param {number} x
 * @param {number} y
 * @param {number} duration
 * @param {string=} str
 * @param {string=} color
 */
function addEffect(effectType, x, y, duration, str, color) {
    effects.push({
        effectType: effectType,
        x: x,
        y: y,
        duration: duration,
        str: str,
        color: color,
        frame: 0
    });
}

function drawEffects() {
    for (let i = effects.length - 1; i >= 0; i--) {
        const effect = effects[i];
        const x = effect.x - viewport.x;
        const y = effect.y - viewport.y;

        if (effect.effectType === EFFECT_TYPE_EXPLOSION) {
            const frame = Math.floor(effect.frame / 6);
            const tx = 128 + 16 * frame;
            const ty = 304;
            app.drawTexture(x, y, tx, ty, 16, 16);

        } else if (effect.effectType === EFFECT_TYPE_TEXT) {
            const y2 = y - Math.min(4, Math.floor(effect.frame / 2));
            app.drawCenteredString(effect.str, x, y2, effect.color);
        }

        effect.frame++;
        if (effect.frame >= effect.duration) {
            effects.splice(i, 1);
        }
    }
}
