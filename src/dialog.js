
const dialogs = [
    {
        // 0
        msg: 'Ok hotshot, teleportation complete.\n' +
            'System check. Do you remember the mission?',
        options: [
            { text: 'ROGER', actionType: 'dialog', nextDialogIndex: 4 },
            { text: 'UH WHAT?', actionType: 'dialog', nextDialogIndex: 1 }
        ],
    },
    {
        // 1
        msg: 'Mother frakking... Teleportation glitch.\n' +
            'You\'re a lost cause. Want advice anyway?',
        options: [
            { text: 'YES', actionType: 'dialog', nextDialogIndex: 2 },
            { text: 'NO', actionType: 'dialog', nextDialogIndex: 3 }
        ]
    },
    {
        // 2
        msg: 'Alright.  Your brain is mush, but we\'ll try.\n' +
            'Find the blaster in the room.',
        options: [
            { text: 'COPY', actionType: 'quest', questIndex: 0 }
        ]
    },
    {
        // 3
        msg: 'Alright.  Your brain is mush, and you\'re\n' +
            'balls deep in aliens who want to kill you.  Good luck.',
        options: [
            { text: 'BYE' }
        ]
    },
    {
        // 4
        msg: 'Good. How do you wanna run this, soldier?\n' +
            'Want me to guide you, or comms off?',
        options: [
            { text: 'GUIDE', actionType: 'dialog', nextDialogIndex: 5 },
            { text: 'COMMS OFF', actionType: 'dialog', nextDialogIndex: 6 }
        ]
    },
    {
        // 5
        msg: 'Alright.  First things first:\n' +
            'Find the blaster in the room.',
        options: [
            { text: 'OK', actionType: 'quest', questIndex: 0 }
        ]
    },
    {
        // 6
        msg: 'Alright.  You know what you\'re doing.\n' +
            'Go get em.',
        options: [
            { text: 'OVER AND OUT' }
        ]
    },
    {
        // 7
        msg: 'Good.  Radar shows alien blood nearby.\n' +
            'Go kill that ugly bastard.',
        options: [
            { text: 'ACCEPT', actionType: 'quest', questIndex: 1 },
            { text: 'IGNORE' }
        ]
    },
    {
        // 8
        msg: 'Not bad, soldier.  That took guts.\n' +
            'Find a BLUE key to get out of this sector.',
        options: [
            { text: 'ACCEPT', actionType: 'quest', questIndex: 2 },
            { text: 'IGNORE' }
        ]
    },
    {
        // 9
        msg: 'Excellent.  Let\'s get the frak out of here.\n' +
            'Find the BLUE door to move to the next sector.',
        options: [
            { text: 'ACCEPT', actionType: 'quest', questIndex: 3 },
            { text: 'IGNORE' }
        ]
    },
];

const dialogState = {
    visible: true,
    index: 0,
    startTime: 0,
    selectedIndex: 0
};

function showDialog(dialogIndex) {
    dialogState.visible = true;
    dialogState.skip = false;
    dialogState.index = dialogIndex;
    dialogState.startTime = t;
}

function hideDialog() {
    dialogState.visible = false;
}

function renderDialog() {
    if (dialogState.visible) {
        // Draw the dialog frame
        drawTexture(48, 0, 512, 256, 208, 32);

        // Draw the speaker avatar
        drawTexture(50, -2, 128, 608, 32, 32);

        const dialog = dialogs[dialogState.index];
        const openTime = t - dialogState.startTime;
        const len = dialogState.skip ? dialog.msg.length : Math.min(dialog.msg.length, Math.floor(openTime / 3));
        const msg = dialog.msg.substr(0, len);
        drawString(msg, 80, 2);
        if (len === dialog.msg.length) {
            for (let i = 0; i < dialog.options.length; i++) {
                drawString(dialog.options[i].text, 100 + i * 50, 20);
            }
        }
    }
}

function handleDialogInput() {
    if (t - dialogState.startTime < 30) {
        // Wait 0.5 seconds for dialog to warm up
        return;
    }

    if (keys[KEY_SPACE]) {
        dialogState.skip = true;
    } else if (keys[KEY_1] || (mouse.down && mouse.x >= 100 && mouse.x < 140 && mouse.y >= 20 && mouse.y < 30)) {
        tryDialogOption(0);
    } else if (keys[KEY_2] || (mouse.down && mouse.x >= 150 && mouse.x < 190 && mouse.y >= 20 && mouse.y < 30)) {
        tryDialogOption(1);
    }
}
