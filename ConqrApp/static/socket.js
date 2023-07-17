const messageArea = document.getElementById('recieved-message');
const messageInput = document.getElementById('message-input');


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
    if (message['type'] === "connected") {
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
    } else if (message['type'] === "failed") {
        SOCKET_ID = message['id']
        showToast('Could not connect')
    } else if (message['msg-type'] === "disconnect") {
        sendMessage(JSON.stringify({ "sender": SOCKET_ID, "type": "heartbeat" }))
        showToast('a player left')
    } else if (message["sender"] == SOCKET_ID) {
        console.log("no change")
    } else {
        var targetDiv = document.getElementById(message['div-id'].toString())
        addLost(targetDiv)
    }
};

var onclose = function (e) {
    console.log('WebSocket connection closed.');
};
// Send message to the server
function sendMessage(message) {
    console.log('Sent message:', message);
    socket.send(message);
}


function updateBoard(boardString) {
    for (i = 0; i < boardString.length; i++) {
        var hexagon = document.getElementById(i)
        if (boardString[i] == "0") {
            hexagon.style.backgroundImage = UNCLAIMED_COLOR
        } else if (boardString[i] == "1") {
            if (SOCKET_ID == 1) {
                hexagon.style.backgroundImage = CLAIMED_COLOR
            } else {
                hexagon.style.backgroundImage = LOST_COLOR
            }
        } else if (boardString[i] == "2") {
            if (SOCKET_ID == 1) {
                hexagon.style.backgroundImage = BOMB_PLANTED_COLOR
            } else {
                hexagon.style.backgroundImage = LOST_COLOR
            }
        } else if (boardString[i] == "3") {
            if (SOCKET_ID == 2) {
                hexagon.style.backgroundImage = CLAIMED_COLOR
            } else {
                hexagon.style.backgroundImage = LOST_COLOR
            }
        } else if (boardString[i] == "4") {
            if (SOCKET_ID == 2) {
                hexagon.style.backgroundImage = BOMB_PLANTED_COLOR
            } else {
                hexagon.style.backgroundImage = LOST_COLOR
            }
        }

    }
    showToast("updated board")
}
