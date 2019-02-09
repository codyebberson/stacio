
const quests = [
    {
        // 0
        title: 'Find blaster',
        objectiveType: 'item',
        itemType: ITEM_TYPE_BLUE_KEY,
        successDialogIndex: 7
    },
    {
        // 1
        title: 'First blood',
        objectiveType: 'kill',
        entityType: ENTITY_TYPE_ALIEN,
        successDialogIndex: 8
    },
    {
        // 2
        title: 'Blue keycard',
        objectiveType: 'item',
        itemType: ITEM_TYPE_BLUE_KEY,
        successDialogIndex: 9
    },
    {
        // 3
        title: 'Blue door',
        objectiveType: 'item',
        itemType: ITEM_TYPE_BLUE_KEY,
        successDialogIndex: 9
    },
    {
        // 4
        title: 'Pick up radio',
        objectiveType: 'item',
        itemType: ITEM_TYPE_RADIO,
        successDialogIndex: 0
    },
];

const questLog = [];

function startQuest(quest) {
    addMessage('Quest accepted: ' + quest.title, 0xFFFF00FF);
    questLog.push(quest);
}

function finishQuest(quest) {
    addMessage('Quest complete: ' + quest.title, 0xFFFF00FF);

    if (quest.successDialogIndex !== undefined) {
        showDialog(quest.successDialogIndex);
    }
}
