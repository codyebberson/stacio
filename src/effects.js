
const effects = [];

function addEffect(x, y) {
    effects.push({
        x: x,
        y: y,
        frame: 0
    });
}

function drawEffects() {
    for (let i = effects.length - 1; i >= 0; i--) {
        const effect = effects[i];
        const x = effect.x - viewport.x;
        const y = effect.y - viewport.y;
        const frame = Math.floor(effect.frame / 6);
        const tx = 128 + 16 * frame;
        const ty = 304;
        app.drawTexture(x, y, tx, ty, 16, 16);
        effect.frame++;
        if (effect.frame >= 18) {
            effects.splice(i, 1);
        }
    }
}
