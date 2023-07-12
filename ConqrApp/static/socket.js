const messageArea = document.getElementById('recieved-message');
const messageInput = document.getElementById('message-input');

// WebSocket connection
const socket = new WebSocket(`ws://${window.location.origin.split("//")[1]}/ws/game-socket/`);

socket.onopen = function () {
    console.log('WebSocket connection established.');
};

var SOCKET_ID = null

socket.onmessage = function (e) {
    var message = JSON.parse(e.data);

    console.log('Received message:', message);
    if (message['type'] === "connected") {
        SOCKET_ID = message['id']
        alert('SOCKET_ID: ' + SOCKET_ID)
    } else if (message["sender"] == SOCKET_ID) {
        console.log("no change")
    } else {
        var targetDiv = document.getElementById(message['div-id'].toString())
        addLost(targetDiv)
    }
    // game.jump()
};

socket.onclose = function (e) {
    console.log('WebSocket connection closed.');
};

// Send message to the server
function sendMessage(message) {
    console.log('Sent message:', message);
    socket.send(message);
    // messageInput.value = '';
}
