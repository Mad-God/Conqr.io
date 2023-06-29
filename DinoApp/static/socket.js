// // websocket.js

// const socket = new WebSocket('ws://localhost:8000/ws/example/');

// socket.onopen = function () {
//   console.log('WebSocket connection established.');
//   // You can send initial messages or perform other actions here
// };

// socket.onmessage = function (e) {
//   const message = e.data;
//   console.log('Received message:', message);
//   // Handle the received message
// };

// socket.onclose = function (e) {
//   console.log('WebSocket connection closed.');
// };

// // Example of sending a message to the server
// function sendMessage(message) {
//   socket.send(message);
// }




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
    messageArea.value += message + '\n';
};

socket.onclose = function (e) {
    console.log('WebSocket connection closed.');
};

// Send message to the server
function sendMessage() {
    const message = messageInput.value;
    console.log('Sent message:', message);
    socket.send(message);
    messageInput.value = '';
}