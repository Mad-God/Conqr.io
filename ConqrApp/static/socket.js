const messageArea = document.getElementById('recieved-message');
const messageInput = document.getElementById('message-input');
// GRID = require('./put-board.js');
// import GRID from './put-board.js'


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

var SOCKET_ID = null

var onmessage = function (e) {
    var message = JSON.parse(e.data);

    console.log('Received message:', message);
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
    } else if (message['msg-type'] === "failed") {
        SOCKET_ID = message['id']
        showToast('Could not connect')
    } else if (message['msg-type'] === "disconnect") {
        sendMessage(JSON.stringify({ "sender": SOCKET_ID, "type": "heartbeat" }))
        showToast('Player left')
    } else if (message["sender"] == SOCKET_ID) {
        console.log("no change")
    } else if (message['msg-type'] === "player-connect") {
        showToast('Player Joined')
    } else {
        var targetDiv = document.getElementById(message['div-id'].toString())
        addLost(targetDiv)
    }
};

var onclose = function (e) {
    console.log('WebSocket connection closed.');
    showToast('Could not connect')
};


// Send message to the server
function sendMessage(message) {
    console.log('Sent message:', message);
    socket.send(message);
}

function getGridElement(id) {
    console.log(GRID, id)
    for (var i = 0; i < GRID.length; i++) {
        for (var j = 0; j < GRID[i].length; j++) {
            if (GRID[i][j][0] == id) {
                return GRID[i][j]
            }
        }
    }
    return null
}


function getNeighbors(id) {
    var ind = 0;
    var neighbors = new Array()
    var ele = getGridElement(id)
    console.log(ele)
    for (var i = 0; i < GRID.length; i++) {
        // for the above elements
        if (i + 1 < GRID.length && GRID[i + 1][0][1] == ele[1]) {
            for (var j = 0; j < GRID[i].length; j++) {
                if (j + 1 < GRID[i].length && GRID[i][j + 1][2] > ele[2] && GRID[i][j][2] < ele[2]) {
                    neighbors.push(GRID[i][j]);
                }
                else if (j - 1 >= 0 && GRID[i][j - 1][2] < ele[2] && GRID[i][j][2] > ele[2]) {
                    neighbors.push(GRID[i][j]);
                }
                else if (j == 0 && GRID[i][j][2] > ele[2]) {
                    neighbors.push(GRID[i][j]);
                }
                else if (j == GRID[i].length - 1 && GRID[i][j][2] < ele[2]) {
                    neighbors.push(GRID[i][j]);
                }

            }
            continue;
        }
        // for same line elements
        else if (i <= GRID.length && GRID[i][0][1] == ele[1]) {
            for (var j = 0; j < GRID[i].length; j++) {
                if (j + 1 < GRID[i].length && GRID[i][j + 1][2] == ele[2] && GRID[i][j][2] < ele[2]) {
                    neighbors.push(GRID[i][j]);
                }
                else if (j - 1 >= 0 && GRID[i][j - 1][2] == ele[2] && GRID[i][j][2] > ele[2]) {
                    neighbors.push(GRID[i][j]);
                }

            }
            continue;
        }
        // for next line elements
        else if (i - 1 >= 0 && i <= GRID.length && GRID[i - 1][0][1] == ele[1]) {
            for (var j = 0; j < GRID[i].length; j++) {
                if (j + 1 < GRID[i].length && GRID[i][j + 1][2] > ele[2] && GRID[i][j][2] < ele[2]) {
                    neighbors.push(GRID[i][j]);
                }
                else if (j - 1 >= 0 && GRID[i][j - 1][2] < ele[2] && GRID[i][j][2] > ele[2]) {
                    neighbors.push(GRID[i][j]);
                }
                else if (j == 0 && GRID[i][j][2] > ele[2]) {
                    neighbors.push(GRID[i][j]);
                }
                else if (j == GRID[i].length - 1 && GRID[i][j][2] < ele[2]) {
                    neighbors.push(GRID[i][j]);
                }

            }
            continue;
        }

    }
    return neighbors
}


function activateNeighbors(id) {
    var neighbors = getNeighbors(id);
    for (var i = 0; i < neighbors.length; i++) {

        var div = document.getElementById(neighbors[i][0])
        console.log(div.id, div.style.backgroundImage, DISABLED_COLOR)
        if (div.style.backgroundImage == DISABLED_COLOR || div.style.backgroundImage == LOST_COLOR) {
            if (div.style.backgroundImage == DISABLED_COLOR)
                div.style.backgroundImage = UNCLAIMED_COLOR
            div.addEventListener('click', leftMouseClickEvent);
            div.addEventListener('contextmenu', rightMouseClickEvent);
        }
        else {
            console.log(div.id, div.style.backgroundImage, DISABLED_COLOR)
        }

    }
}

function activateSelf(id, boardString) {
    var neighbors = getNeighbors(id);
    for (var i = 0; i < neighbors.length; i++) {
        if (SOCKET_ID == 1 && (boardString[neighbors[i][0]] == '1' || boardString[neighbors[i][0]] == '2')) {
            return true
        }
        else if (SOCKET_ID == 2 && (boardString[neighbors[i][0]] == '4' || boardString[neighbors[i][0]] == '3')) {
            return true
        }
    }
    return false
}


function updateBoard(boardString) {
    for (i = 0; i < boardString.length; i++) {
        var hexagon = document.getElementById(i)
        var gele = getGridElement(id = i)
        gele[3] = boardString[i]
        hexagon.addEventListener('click', leftMouseClickEvent);
        hexagon.addEventListener('contextmenu', rightMouseClickEvent);
        if (boardString[i] == "0") {
            if (activateSelf(id, boardString)) {
                hexagon.style.backgroundImage = UNCLAIMED_COLOR

            } else {
                hexagon.style.backgroundImage = DISABLED_COLOR
                hexagon.removeEventListener('click', leftMouseClickEvent);
                hexagon.removeEventListener('contextmenu', rightMouseClickEvent);
            }
        } else if (boardString[i] == "1") {
            if (SOCKET_ID == 1) {
                hexagon.style.backgroundImage = CLAIMED_COLOR
            } else {
                hexagon.style.backgroundImage = LOST_COLOR
                if (!activateSelf(id, boardString)) {
                    hexagon.removeEventListener('click', leftMouseClickEvent);
                    hexagon.removeEventListener('contextmenu', rightMouseClickEvent);
                }
            }
        } else if (boardString[i] == "2") {
            if (SOCKET_ID == 1) {
                hexagon.style.backgroundImage = BOMB_PLANTED_COLOR
            } else {
                hexagon.style.backgroundImage = LOST_COLOR
                if (!activateSelf(id, boardString)) {
                    hexagon.removeEventListener('click', leftMouseClickEvent);
                    hexagon.removeEventListener('contextmenu', rightMouseClickEvent);
                }
            }
        } else if (boardString[i] == "3") {
            if (SOCKET_ID == 2) {
                hexagon.style.backgroundImage = CLAIMED_COLOR
            } else {
                hexagon.style.backgroundImage = LOST_COLOR
                if (!activateSelf(id, boardString)) {
                    hexagon.removeEventListener('click', leftMouseClickEvent);
                    hexagon.removeEventListener('contextmenu', rightMouseClickEvent);
                }
            }
        } else if (boardString[i] == "4") {
            if (SOCKET_ID == 2) {
                hexagon.style.backgroundImage = BOMB_PLANTED_COLOR
            } else {
                hexagon.style.backgroundImage = LOST_COLOR
                if (!activateSelf(id, boardString)) {
                    hexagon.removeEventListener('click', leftMouseClickEvent);
                    hexagon.removeEventListener('contextmenu', rightMouseClickEvent);
                }
            }
        }

    }
    showToast("updated board")
}
