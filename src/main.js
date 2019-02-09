
const musicPlayer = new Audio('https://static.cody.xyz/syndicate.lubiki.pl/synd_music_ingame_standard_final_mq.mp3');

function main() {
    // Clear the window hash on load
    // Always start at the root
    window.location.hash = '';

    // Subscribe to future window hash change events
    window.addEventListener('hashchange', handleHashChange);

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

function handleHashChange() {
    const hash = window.location.hash;

    if (hash === '#game') {
        app.update = update;
    } else if (hash === '#highscores') {
        app.update = highScores;
    } else if (hash === '#credits') {
        app.update = credits;
    } else {
        app.update = mainMenu;
    }
}

function landingPage() {
    app.drawCenteredString('STACIO', app.center.x, 30);
    app.drawTexture(app.center.x - 16, app.center.y - 16, 640, 208, 32, 32);

    if (app.keys[KEY_ENTER].downCount === 1 || app.mouse.upCount === 1) {
        window.location.hash = 'mainmenu';
    }
}

function mainMenu() {
    app.drawCenteredString('STACIO', app.center.x, 30);

    const startY = 80;
    const menuItems = [
        {
            display: 'NEW GAME',
            hash: 'game',
            enabled: true
        },
        {
            display: 'CONTINUE',
            hash: 'game',
            enabled: false
        },
        {
            display: 'ENTER SEED',
            hash: 'seed',
            enabled: true
        },
        {
            display: 'TUTORIAL',
            hash: 'tutorial',
            enabled: true
        },
        {
            display: 'HIGH SCORES',
            hash: 'highscores',
            enabled: true
        },
        {
            display: 'CREDITS',
            hash: 'credits',
            enabled: true
        },
    ];

    const clicked = app.keys[KEY_ENTER].downCount === 1 || app.mouse.upCount === 1;
    let y = 80;
    for (let i = 0; i < menuItems.length; i++) {
        const item = menuItems[i];
        const color = item.enabled ? 0xFFFFFFFF : 0x808080FF;
        app.drawCenteredString(item.display, app.center.x, y, color);

        if (clicked && isMouseInRect(app.center.x - 20, y, 40, 10)) {
            window.location.hash = item.hash;
        }

        y += 10;
    }
}

function highScores() {
    app.drawCenteredString('STACIO', app.center.x, 20);

    const x = app.center.x - 40;

    for (let i = 0; i < 10; i++) {
        const name = 'AAA'
        const scoreStr = ((10 - i) * 100).toString();
        app.drawString(name, x, 50 + i * 10);
        app.drawString(scoreStr, x + 60, 50 + i * 10);
    }

    if (app.keys[KEY_ENTER].downCount === 1 || app.mouse.upCount === 1) {
        window.location.hash = 'mainmenu';
    }
}

function credits() {
    app.drawCenteredString('STACIO', app.center.x, 20);

    const x = app.center.x - 40;

    app.drawString('CODE AND DESIGN:', x, 40, 0x808080FF);
    app.drawString('CODY.XYZ', x + 20, 50);

    app.drawString('GRAPHICS:', x, 60, 0x808080FF);
    app.drawString('ORYX DEISGN LAB', x + 20, 70);
    app.drawString('oryxdesignlab.com', x + 20, 80);

    app.drawString('FONT:', x, 90, 0x808080FF);
    app.drawString('LEXALOFFLE', x + 20, 100);
    app.drawString('LEXALOFFLE.COM', x + 20, 110);

    app.drawString('MUSIC:', x, 120, 0x808080FF);
    app.drawString('ERIC MATYAS', x + 20, 130);
    app.drawString('WWW.SOUNDIMAGE.ORG', x + 20, 140);

    if (app.keys[KEY_ENTER].downCount === 1 || app.mouse.upCount === 1) {
        window.location.hash = 'mainmenu';
    }
}

main();
