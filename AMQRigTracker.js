// ==UserScript==
// @name         AMQRigTracker
// @namespace    something
// @version      0.1
// @description  Track Score Information in AMQ
// @match        https://animemusicquiz.com/
// @grant        none
// ==/UserScript==

var answerInformation = Array(40);

function GetAnswerInformation() {
    var players = document.querySelectorAll('.qpAvatarCenterContainer');
    var firstSong = parseInt(document.querySelector('#qpCurrentSongCount').innerText) === 1;
    if (firstSong) {
        for (var i=0; i < players.length; i++) {
            let playerName = players[i].querySelector('.qpAvatarNameContainer span').innerText;
            let playerScore = players[i].querySelector('.qpAvatarPointText').innerText;
            let onPlayerList = !players[i].querySelector('.qpAvatarStatus').classList.contains('hide');
            let playerAnswer = players[i].querySelector('.qpAvatarAnswerText').innerText;
            let rightAnswer = players[i].querySelector('.qpAvatarAnswerContainer').classList.contains('rightAnswer');
            answerInformation[i] = {
                playerName: playerName,
                playerScore: playerScore,
                onPlayerList: [onPlayerList],
                playerAnswer: [playerAnswer],
                rightAnswer: [rightAnswer]
            }
        }
    }
    else {
        for (var j = 0; j < players.length; j++) {
            answerInformation[j].playerScore = players[j].querySelector('.qpAvatarPointText').innerText;
            answerInformation[j].onPlayerList.push(!players[j].querySelector('.qpAvatarStatus').classList.contains('hide'));
            answerInformation[j].playerAnswer.push(players[j].querySelector('.qpAvatarAnswerText').innerText);
            answerInformation[j].rightAnswer.push(players[j].querySelector('.qpAvatarAnswerContainer').classList.contains('rightAnswer'));
        }
    }
}

function GetRig(playerInformation) {
    return playerInformation.onPlayerList.filter(rig => rig === true).length;
}

function WriteRigToChat() {
    var enterEvent = new KeyboardEvent('keypress', {altKey:false,
                                           bubbles: true,
                                           cancelBubble: false,
                                           cancelable: true,
                                           charCode: 0,
                                           code: "Enter",
                                           composed: true,
                                           ctrlKey: false,
                                           currentTarget: null,
                                           defaultPrevented: true,
                                           detail: 0,
                                           eventPhase: 0,
                                           isComposing: false,
                                           isTrusted: true,
                                           key: "Enter",
                                           keyCode: 13,
                                           location: 0,
                                           metaKey: false,
                                           repeat: false,
                                           returnValue: false,
                                           shiftKey: false,
                                           type: "keydown",
                                           which: 13});
    var chatInput = document.querySelector('#gcInput');
    //to prevent errors, make sure there is an entry for player 2
    if (answerInformation[1]) {
        chatInput.value = answerInformation[0].playerName + ' vs ' + answerInformation[1].playerName +
            " score: " + answerInformation[0].playerScore + " - " + answerInformation[1].playerScore +
            " rig: " + GetRig(answerInformation[0]) + " - " + GetRig(answerInformation[1]);
    }
    else {
        chatInput.value = answerInformation[0].playerName +
            " score: " + answerInformation[0].playerScore +
            " rig: " + GetRig(answerInformation[0]);
    }
    chatInput.dispatchEvent(enterEvent);
}

function WriteRigToLevel() {
    //There are 2 lvl fields for every character
    let levelField = document.querySelectorAll('.qpAvatarLevelText');
    for (var i=0; i < levelField.length; i++) {
        levelField[i].innerText = GetRig(answerInformation[Math.round((i - 1)/2)]);
    }
}

function IfRoundIsOver() {
    let currentSongCount = parseInt(document.querySelector('#qpCurrentSongCount').innerText);
    let totalSongCount = parseInt(document.querySelector('#qpTotalSongCount').innerText);
    return currentSongCount / totalSongCount === 1;
}

const SongCounterCallback = function(mutationsList, observer) {
    for(let mutation of mutationsList) {
        if (mutation.type === 'attributes') {
			if (document.querySelector('#qpAnimeNameHider').classList.contains('hide'))
			{
                GetAnswerInformation();
                WriteRigToLevel();
                WriteRigToChat();
			}
        }
    }
};

// Observe when the answer is revealed
function observeAnswerShowing() {
    var countdown = document.querySelector('#qpAnimeNameHider');
    var countdownConfig = { attributes: true};
    var countdownObserver = new MutationObserver(SongCounterCallback);
    countdownObserver.observe(countdown, countdownConfig);
}

function startAmqScript() {
    console.log("HAI");
    observeAnswerShowing();
}

document.querySelector("#mpPlayButton").addEventListener('click', function() {
    startAmqScript();
});
