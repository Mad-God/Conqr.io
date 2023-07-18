BOMB_PLANTED_COLOR = 'linear-gradient(90deg, rgb(43 131 78), rgb(10 77 0))'
BOMB_PLANTED_COLOR = 'linear-gradient(90deg, rgb(43, 131, 78), rgb(10, 77, 0))'
CLAIMED_COLOR = 'linear-gradient(90deg, #70eb98, #09bb23)'
CLAIMED_COLOR = 'linear-gradient(90deg, rgb(112, 235, 152), rgb(9, 187, 35))'
UNCLAIMED_COLOR = 'linear-gradient(90deg, #84cfe5, #05a9f5)'
UNCLAIMED_COLOR = 'linear-gradient(90deg, #84cfe5, #05a9f5)'
LOST_COLOR = 'linear-gradient(90deg, #e69a9a, #f65369)'
LOST_COLOR = 'linear-gradient(90deg, rgb(230, 154, 154), rgb(246, 83, 105))'
DISABLED_COLOR = 'linear-gradient(211deg, #9b9dad, rgba(0, 0, 0, 0.2))'
DISABLED_COLOR = 'linear-gradient(211deg, rgb(155, 157, 173), rgba(0, 0, 0, 0.2))'
var GRID = new Array()


function put_button(container, position) {
    var hexagon = document.createElement("div")
    hexagon.className = "hexagon"
    hexagon.style.top = position[0] + hexagon_width + "px"
    hexagon.style.left = position[1] + hexagon_height + "px"
    hexagon.style.width = hexagon_width + "px";
    hexagon.style.height = hexagon_height + "px";
    hexagon.style.backgroundImage = DISABLED_COLOR
    hexagon.id = hex_id;
    hexagon.innerText = hex_id
    hexagon.style.padding = '10px'
    hex_id += 1;
    container.appendChild(hexagon)
    // hexagon.addEventListener("")
    // hexagon.addEventListener('click', leftMouseClickEvent);
    // hexagon.addEventListener('contextmenu', rightMouseClickEvent);
}


// Get the div element
const divElement = document.querySelector('.my-div');

function activateSelf(id, boardString) {
    var neighbors = getNeighbors(id);
    for (var i = 0; i < neighbors.length; i++) {
        var neighbor_ele = document.getElementById(neighbors[i][0])
        if (SOCKET_ID == 1 && (neighbor_ele.style.backgroundImage == CLAIMED_COLOR || neighbor_ele.style.backgroundImage == BOMB_PLANTED_COLOR)) {
            return true
        }
        else if (SOCKET_ID == 2 && (neighbor_ele.style.backgroundImage == BOMB_PLANTED_COLOR || neighbor_ele.style.backgroundImage == CLAIMED_COLOR)) {
            return true
        }
    }
    return false
}


const leftMouseClickEvent = function (event) {
    if (event.button === 0) {
        this.style.backgroundImage = CLAIMED_COLOR
        activateNeighbors(this.id)
        sendMessage(JSON.stringify({ "id": this.id, 'sender': SOCKET_ID, 'bombed': false }))
    }
}

const rightMouseClickEvent = function (event) {
    event.preventDefault();
    this.style.backgroundImage = BOMB_PLANTED_COLOR
    var neighbors = getNeighbors(this.id)
    for (var i = 0; i < neighbors.length; i++) {
        if (activateSelf(neighbors[i])) {
            neighbor_hexagon.addEventListener('click', leftMouseClickEvent);
            neighbor_hexagon.addEventListener('contextmenu', rightMouseClickEvent);
            if (this.style.backgroundImage == DISABLED_COLOR) {
                this.style.backgroundImage = UNCLAIMED_COLOR
            }
        }
        else {
            neighbor_hexagon.removeEventListener('click', leftMouseClickEvent);
            neighbor_hexagon.removeEventListener('contextmenu', rightMouseClickEvent);
            if (this.style.backgroundImage == UNCLAIMED_COLOR) {
                this.style.backgroundImage = DISABLED_COLOR
            }
        }
        sendMessage(JSON.stringify({ "id": this.id, 'sender': SOCKET_ID, 'bombed': true }))
    }
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
    var hid = 0
    for (var i = 0; i < rows; i++) {
        GRID.push(new Array())
        for (var j = 0; j < columns + i; j++) {
            GRID[GRID.length - 1].push([hid, base_top + (i * (hexagon_height / 4)) + (i * hexagon_height / 1.2), base_left + (j * hexagon_width) - i * (hexagon_width / 2), 0])
            put_button(grid, [base_top + (i * (hexagon_height / 4)) + (i * hexagon_height / 1.2), base_left + (j * hexagon_width) - i * (hexagon_width / 2)]);
            hid += 1;
        }
    }
    columns += rows;
    for (var i = 0; i < rows - 1; i++) {
        GRID.push(new Array())
        for (var j = 0; j < columns - i - 2; j++) {
            GRID[GRID.length - 1].push([hid, base_top + ((i + rows - 1) * (hexagon_height / 4)) + ((i + rows) * hexagon_height / 1.2) + (hexagon_height / 4), base_left + (j * hexagon_width) - (rows - i - 2) * (hexagon_width / 2), 0])
            put_button(grid, [base_top + ((i + rows - 1) * (hexagon_height / 4)) + ((i + rows) * hexagon_height / 1.2) + (hexagon_height / 4), base_left + (j * hexagon_width) - (rows - i - 2) * (hexagon_width / 2)]);
            hid += 1
        }
    }
    console.log(GRID)
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



// module.exports = GRID;
// export default myObject;
