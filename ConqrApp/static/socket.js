var SOCKET_ID = null

console.log("waiting")
// WebSocket connection
setTimeout(() => {
    console.log("exceuting")
    socket = new WebSocket(`ws://${window.location.origin.split("//")[1]}/ws/game-socket/?room_id=${window.location.href.split("room_id=")[1]}`);

    socket.onopen = onopen
    socket.onmessage = onmessage
    socket.onclose = onclose;

}, 1000)

var onopen = function () {
    console.log('WebSocket connection established.');
};


var onmessage = function (e) {
    var message = JSON.parse(e.data);

    console.log('Received message:', message);


    // if the user has joined initially
    if (message['msg-type'] === "connected") {
        SOCKET_ID = message['player_id']
        try {
            // adddlert("Welcome guest!");
            setTimeout(
                () => {
                    updateBoard(message["board"])
                }
                , 1000)
        }
        catch (err) {
            // alert("couldnt update",)
            alert(err)
        }
        showToast('SOCKET_ID: ' + SOCKET_ID)
        if (message["both-player-joined"]) {
            OPPENENT_JOINED = true;
        }
        BOMB_COUNT = message["player-bomb-count"]
    }

    // if lobby could not be joined
    else if (message['msg-type'] === "failed") {
        SOCKET_ID = message['id']
        showToast('Could not join room')
        setTimeout(() => { window.location.replace("/") }, 3000);
    }

    // if a player left
    else if (message['msg-type'] === "disconnect") {
        sendMessage(JSON.stringify({ "sender": SOCKET_ID, "type": "heartbeat" }))
        showToast('Player left')
        OPPENENT_JOINED = false;
    }

    // if the message recieved regarding self action
    else if (message["sender"] == SOCKET_ID) {
        console.log("no change")
    }

    // if another player has joined
    else if (message['msg-type'] === "player-connect") {
        if (message["player-id"] != SOCKET_ID) {
            showToast('Player Joined')
            OPPENENT_JOINED = true;
        }
    }

    else if (message["msg-type"] == 'game-over') {
        showGameOverModal(lost = message['loser'] == SOCKET_ID)
    }

    // make a move on the board
    else {
        var targetDiv = document.getElementById(message['div-id'].toString())
        var is_bombed = message["is_bombed"]
        if (message["is_neutralised"]) {
            neutraliseDiv(targetDiv)
            setTimeout(() => {
                activateSelfComplete(targetDiv.id)
            }, 1000)
        }
        else {
            addLost(targetDiv, is_bombed)
        }
    }
};

var onclose = function (e) {
    console.log('WebSocket connection closed.');
    showToast('Could not connect', 5)
    setTimeout(() => { window.location.replace("/") }, 3000);
};


// Send message to the server
function sendMessage(message) {
    console.log('Sent message:', message);
    socket.send(message);
}


function updateBoard(boardString) {
    // go thorugh each boardstring character
    for (i = 0; i < boardString.length; i++) {

        // get hexagon element from index
        var hexagon = document.getElementById(i)
        var gele = getGridElement(id = i)
        gele[3] = boardString[i]
        hexagon.addEventListener('click', leftMouseClickEvent);
        hexagon.addEventListener('contextmenu', rightMouseClickEvent);
        if (boardString[i] == "0") {
            if (activateSelfFromGrid(id, boardString)) {
                hexagon.style.backgroundImage = UNCLAIMED_COLOR

            } else {
                hexagon.style.backgroundImage = DISABLED_COLOR
                hexagon.removeEventListener('click', leftMouseClickEvent);
                hexagon.removeEventListener('contextmenu', rightMouseClickEvent);
            }
        } else if (boardString[i] == "1") {
            if (SOCKET_ID == 1) {
                hexagon.style.backgroundImage = CLAIMED_COLOR
                // CLAIMED_COUNT = Number(CLAIMED_COUNT) + 1;
            } else {
                hexagon.style.backgroundImage = LOST_COLOR
                // LOST_COUNT = Number(LOST_COUNT) + 1;
                if (!activateSelfFromGrid(id, boardString)) {
                    hexagon.removeEventListener('click', leftMouseClickEvent);
                    hexagon.removeEventListener('contextmenu', rightMouseClickEvent);
                }
            }
        } else if (boardString[i] == "2") {
            if (SOCKET_ID == 1) {
                hexagon.style.backgroundImage = BOMB_PLANTED_COLOR
                // CLAIMED_COUNT = Number(CLAIMED_COUNT) + 1;
            } else {
                hexagon.style.backgroundImage = LOST_COLOR
                // LOST_COUNT = Number(LOST_COUNT) + 1;
                if (!activateSelfFromGrid(id, boardString)) {
                    hexagon.removeEventListener('click', leftMouseClickEvent);
                    hexagon.removeEventListener('contextmenu', rightMouseClickEvent);
                }
            }
        } else if (boardString[i] == "3") {
            if (SOCKET_ID == 2) {
                hexagon.style.backgroundImage = CLAIMED_COLOR
                // CLAIMED_COUNT = Number(CLAIMED_COUNT) + 1;
            } else {
                hexagon.style.backgroundImage = LOST_COLOR
                // LOST_COUNT = Number(LOST_COUNT) + 1;
                if (!activateSelfFromGrid(id, boardString)) {
                    hexagon.removeEventListener('click', leftMouseClickEvent);
                    hexagon.removeEventListener('contextmenu', rightMouseClickEvent);
                }
            }
        } else if (boardString[i] == "4") {
            if (SOCKET_ID == 2) {
                hexagon.style.backgroundImage = BOMB_PLANTED_COLOR
                // CLAIMED_COUNT = Number(CLAIMED_COUNT) + 1;
            } else {
                hexagon.style.backgroundImage = LOST_COLOR
                // LOST_COUNT = Number(LOST_COUNT) + 1;
                if (!activateSelfFromGrid(id, boardString)) {
                    hexagon.removeEventListener('click', leftMouseClickEvent);
                    hexagon.removeEventListener('contextmenu', rightMouseClickEvent);
                }
            }
        }

    }
    showToast("updated board")
    updateInformation()
}
