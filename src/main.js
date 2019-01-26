
const musicPlayer = new Audio('https://static.cody.xyz/syndicate.lubiki.pl/synd_music_ingame_standard_final_mq.mp3');

function main() {
    const canvas = document.querySelector('canvas');
    canvas.addEventListener('click', firstClick);

    function firstClick() {
        canvas.removeEventListener('click', firstClick);
        musicPlayer.loop = true;
        musicPlayer.play();
    }

    app = new wglt.Application(canvas);
    app.update = landingPage;
    keyboard = app.keyboard;
    keys = app.keys;
    gl = app.gl;
    mouse = app.mouse;
}

function landingPage() {
    app.drawCenteredString('STACIO', app.center.x, 30);
    app.drawTexture(app.center.x - 16, app.center.y - 16, 640, 208, 32, 32);

    if (app.keys[KEY_ENTER].downCount === 1 || app.mouse.upCount === 1) {
        app.update = mainMenu;
    }
}

function mainMenu() {
    app.drawCenteredString('STACIO', app.center.x, 30);
    app.drawCenteredString('NEW GAME', app.center.x, 80);
    app.drawCenteredString('CONTINUE', app.center.x, 90, 0x808080FF);
    app.drawCenteredString('ENTER SEED', app.center.x, 100);
    app.drawCenteredString('TUTORIAL', app.center.x, 110);
    app.drawCenteredString('HIGH SCORES', app.center.x, 120);
    app.drawCenteredString('CREDITS', app.center.x, 130);

    if (app.keys[KEY_ENTER].downCount === 1 || app.mouse.upCount === 1) {
        if (isMouseInRect(app.center.x - 20, 130, 40, 10)) {
            app.update = credits;
        } else {
            app.update = update;
        }
    }
}

function credits() {
    app.drawCenteredString('STACIO', app.center.x, 30);

    const x = app.center.x - 40;

    app.drawString('CODE AND DESIGN:', x, 60);
    app.drawString('CODY.XYZ', x + 10, 70);

    app.drawString('GRAPHICS:', x, 90);
    app.drawString('ORYX DEISGN LAB', x + 10, 100);
    app.drawString('oryxdesignlab.com', x + 10, 110);

    app.drawString('MUSIC:', x, 130);
    app.drawString('ERIC MATYAS', x + 10, 140);
    app.drawString('WWW.SOUNDIMAGE.ORG', x + 10, 150);

    if (app.keys[KEY_ENTER].downCount === 1 || app.mouse.upCount === 1) {
        app.update = mainMenu;
    }
}

main();
