const messageArea = document.getElementById('message-area');
const messageInput = document.getElementById('message-input');

// WebSocket connection
const socket = new WebSocket(`ws://${window.location.origin.split("//")[1]}/ws/example/`);

socket.onopen = function () {
    console.log('WebSocket connection established.');
};



socket.onmessage = function (e) {
    const message = e.data;
    console.log('Received message:', message);
    // messageArea.value += message + '\n';
};

socket.onclose = function (e) {
    console.log('WebSocket connection closed.');
};

// Send message to the server
function sendMessage(message) {
    // const message = messageInput.value;
    console.log('Sent message:', message);
    socket.send(message);
    // messageInput.value = '';
}
