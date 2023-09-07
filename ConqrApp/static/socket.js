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

    // console.log('Received message:', message);
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

    // if AI sends a move to make
    else if (message['msg-type'] === "ai-move") {
        console.log("ai move: ", message)
        makeAIMove(message)
    }

    // If game is Over
    else if (message["msg-type"] == 'game-over') {
        showGameOverModal(lost = message['loser'] == SOCKET_ID)
        payLoad = {}
        payLoad["type"] = "game-over"
        payLoad["player_id"] = SOCKET_ID
        sendMessage(JSON.stringify(payLoad))
    }

    // if game has timed out
    else if (message["msg-type"] == 'game-timeout') {
        payLoad = {}
        payLoad["type"] = "calculate-fitness"
        sendMessage(JSON.stringify(payLoad))
        setTimeout(() => {
            socket.close()
        }, 1000)
        if (SOCKET_ID == 2) {
            window.close()
        } else if (SOCKET_ID == 1) {
            setTimeout(() => { window.location.replace("/?restart=" + SOCKET_ID) }, 3000);
        } else {
            console.log("ERROR LINE 101: Invalid SOCKET_ID: ", SOCKET_ID)
        }
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
    const trigger_ai_move_interval = setInterval(triggerAIMove, 500);
}


function triggerAIMove() {
    var currentTime = new Date();
    var move_batch = currentTime.getSeconds();

    const gridDiv = document.getElementById('grid');
    var board_list = []
    var accessible_hex = new Set()
    var already_claimed = new Set()
    if (gridDiv) {
        // Get all the hex div elements.
        const hexDivs = gridDiv.getElementsByTagName('div');

        // Loop over all the hex div elements.
        for (let i = 0; i < hexDivs.length; i++) {
            // console.log(hexDivs[i].textContent);
            if (hexDivs[i].style.backgroundImage == LOST_COLOR) {
                board_list.push(4);
            }
            else if (hexDivs[i].style.backgroundImage == BOMB_PLANTED_COLOR) {
                board_list.push(2);
                already_claimed.add(i)
                var neighbors = getNeighbors(hexDivs[i].id)
                // console.log(neighbors, hexDivs[i].id)
                for (let k = 0; k < neighbors.length; k++) {
                    if (document.getElementById(neighbors[k][0]).style.backgroundImage == BOMB_PLANTED_COLOR || document.getElementById(neighbors[k][0]).style.backgroundImage == CLAIMED_COLOR) {

                    }
                    else {
                        accessible_hex.add(neighbors[k][0]);
                    }

                }

            }
            else if (hexDivs[i].style.backgroundImage == CLAIMED_COLOR) {
                already_claimed.add(i)
                board_list.push(1);
                var neighbors = getNeighbors(hexDivs[i].id)
                // console.log(neighbors, hexDivs[i].id)
                for (let k = 0; k < neighbors.length; k++) {
                    if (document.getElementById(neighbors[k][0]).style.backgroundImage == BOMB_PLANTED_COLOR || document.getElementById(neighbors[k][0]).style.backgroundImage == CLAIMED_COLOR) {

                    }
                    else {
                        accessible_hex.add(neighbors[k][0]);
                    }
                }

            }
            else if (hexDivs[i].style.backgroundImage == DISABLED_COLOR) {
                board_list.push(0);
            }
            else {
                board_list.push(0);
                accessible_hex.add(i)
            }

        }
    } else {
        console.log("Element with id 'grid' not found.");
        return
    }
    var accessible_hexes = new Set([...accessible_hex].filter(value => !already_claimed.has(value)));


    payLoad = {}
    payLoad["type"] = "get-ai-move"
    payLoad["player_id"] = SOCKET_ID
    // payLoad["hex_id"] = hex_id
    payLoad["board_string"] = board_list
    payLoad["bombs_available"] = BOMB_COUNT
    var local_count = getClaimCount()
    var claim_count = local_count[0]
    var lost_count = local_count[1]
    payLoad["lost_count"] = lost_count
    payLoad["claim_count"] = claim_count
    payLoad["claim_count"] = move_batch
    payLoad["accessible_hexes"] = Array.from(accessible_hexes)
    console.log("123123", payLoad["accessible_hexes"])
    sendMessage(JSON.stringify(payLoad))


}

function makeAIMove(data) {
    if (data["move"] == 1) {
        var hex_div = document.getElementById(data["hex-id"])
        hex_div.click()
    }
    else if (data["move"] == 2) {
        var hex_div = document.getElementById(data["hex-id"])
        if (!OPPENENT_JOINED) {
            return
        }
        addBomb(hex_div)
    }
    else if (data["move"] == 0) {
        return
    }
    else {
        console.log("SOMETHING WENT WRONG !!!", data)
    }
}


function endGameByTimeout() {
    payLoad = {}
    payLoad["type"] = "timeout"
    payLoad["player_id"] = SOCKET_ID
    sendMessage(JSON.stringify(payLoad))
    clearInterval(issue_bomb_interval);
    clearInterval(sync_bombs_interval);
    clearInterval(trigger_ai_move_interval)
}


setTimeout(() => {
    endGameByTimeout();
}, 10 * 1000)