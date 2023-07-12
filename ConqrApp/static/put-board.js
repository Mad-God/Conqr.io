BOMB_PLANTED_COLOR = 'linear-gradient(90deg, rgb(43 131 78), rgb(10 77 0))'
CLAIMED_COLOR = 'linear-gradient(90deg, #70eb98, #09bb23)'
UNCLAIMED_COLOR = 'linear-gradient(90deg, #84cfe5, #05a9f5)'
LOST_COLOR = 'linear-gradient(90deg, #e69a9a, #f65369)'



function put_button(container, position) {
    var hexagon = document.createElement("div")
    hexagon.className = "hexagon"
    hexagon.style.top = position[0] + hexagon_width + "px"
    hexagon.style.left = position[1] + hexagon_height + "px"
    hexagon.style.width = hexagon_width + "px";
    hexagon.style.height = hexagon_height + "px";
    hexagon.style.backgroundImage = UNCLAIMED_COLOR
    // hexagon.style.color = 'red';
    hexagon.id = hex_id;
    hex_id += 1;
    container.appendChild(hexagon)
    // hexagon.addEventListener("")
    hexagon.addEventListener('click', leftMouseClickEvent);
    hexagon.addEventListener('contextmenu', rightMouseClickEvent);
}

// Get the div element
const divElement = document.querySelector('.my-div');

const leftMouseClickEvent = function (event) {
    if (event.button === 0) {
        this.style.backgroundImage = BOMB_PLANTED_COLOR
        sendMessage(JSON.stringify({ "id": this.id, 'sender': SOCKET_ID }))
    }
}

const rightMouseClickEvent = function (event) {
    event.preventDefault();
    this.style.backgroundImage = CLAIMED_COLOR
    sendMessage(JSON.stringify({ "id": this.id, 'sender': SOCKET_ID }))
}


const addBomb = function (div) {
    div.style.backgroundImage = BOMB_PLANTED_COLOR
}


const addClaim = function (div) {
    div.style.backgroundImage = CLAIMED_COLOR
}

const addLost = function (div) {
    div.style.backgroundImage = LOST_COLOR
}

function add_hexagons(rows, columns) {
    for (var i = 0; i < rows; i++) {
        for (var j = 0; j < columns + i; j++) {
            put_button(grid, [base_top + (i * (hexagon_height / 4)) + (i * hexagon_height / 1.2), base_left + (j * hexagon_width) - i * (hexagon_width / 2)]);
        }
    }
    columns += rows;
    for (var i = 0; i < rows - 1; i++) {
        for (var j = 0; j < columns - i - 2; j++) {
            put_button(grid, [base_top + ((i + rows - 1) * (hexagon_height / 4)) + ((i + rows) * hexagon_height / 1.2) + (hexagon_height / 4), base_left + (j * hexagon_width) - (rows - i - 2) * (hexagon_width / 2)]);
        }
    }
}


var grid = document.getElementById("grid")
var delta_vertical = 0;
var delta_horizontal = 0;

var screen_ratio = grid.offsetWidth / grid.offsetHeight;
if (Math.floor(screen_ratio)) {
    var hexagon_width = grid.offsetWidth / 20;
    var hexagon_height = grid.offsetHeight / 15;
} else {
    var hexagon_width = grid.offsetWidth / 15;
    var hexagon_height = grid.offsetHeight / 20;
}


var base_left = grid.offsetWidth * 0.2;
var base_top = grid.offsetHeight * 0.01;
var rows = 5;
var columns = 5;

var hex_id = 0;

add_hexagons(rows = rows, columns = columns)


