
const quests = [
    {
        // 0
        title: 'Find blaster',
        objectiveType: 'item',
        entityType: ENTITY_TYPE_BLASTER,
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
        entityType: ENTITY_TYPE_BLUE_KEYCARD,
        successDialogIndex: 9
    },
    {
        // 3
        title: 'Blue door',
        objectiveType: 'item',
        entityType: ENTITY_TYPE_BLUE_KEYCARD,
        successDialogIndex: 9
    },
];

const questLog = [];

function startQuest(quest) {
    addMessage('Quest accepted: ' + quest.title, 0xFFFF00FF);
    questLog.push(quest);
}

function finishQuest(quest) {
    addMessage('Quest complete: ' + quest.title, 0xFFFF00FF);

    if (quest.successDialogIndex) {
        showDialog(quest.successDialogIndex);
    }
}
