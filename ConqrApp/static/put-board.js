BOMB_PLANTED_COLOR = 'linear-gradient(90deg, rgb(43 131 78), rgb(10 77 0))'
BOMB_PLANTED_COLOR = 'linear-gradient(90deg, rgb(43, 131, 78), rgb(10, 77, 0))'
CLAIMED_COLOR = 'linear-gradient(90deg, #70eb98, #09bb23)'
CLAIMED_COLOR = 'linear-gradient(90deg, rgb(112, 235, 152), rgb(9, 187, 35))'
UNCLAIMED_COLOR = 'linear-gradient(90deg, #84cfe5, #05a9f5)'
UNCLAIMED_COLOR = "linear-gradient(90deg, rgb(132, 207, 229), rgb(5, 169, 245))"
LOST_COLOR = 'linear-gradient(90deg, #e69a9a, #f65369)'
LOST_COLOR = 'linear-gradient(90deg, rgb(230, 154, 154), rgb(246, 83, 105))'
DISABLED_COLOR = 'linear-gradient(211deg, #9b9dad, rgba(0, 0, 0, 0.2))'
DISABLED_COLOR = 'linear-gradient(211deg, rgb(155, 157, 173), rgba(0, 0, 0, 0.2))'
var GRID = new Array()
var OPPENENT_JOINED = false;
var CLAIMED_COUNT = 0;
var LOST_COUNT = 0;


function updateInformation() {
    var claim_count = document.getElementById("claim-info")
    claim_count.innerText = claim_count.innerText.split(":")[0] + `: ${CLAIMED_COUNT}`;
    var lost_count = document.getElementById("lost-info")
    lost_count.innerText = lost_count.innerText.split(":")[0] + `: ${LOST_COUNT}`;
    var player_count = document.getElementById("player-info")
    player_count.innerText = player_count.innerText.split(":")[0] + `: ${SOCKET_ID}`;
}


function put_button(container, position) {
    var hexagon = document.createElement("div")
    hexagon.className = "hexagon"
    hexagon.style.top = position[0] + hexagon_width + "px"
    hexagon.style.left = position[1] + hexagon_height + "px"
    hexagon.style.width = hexagon_width + "px";
    hexagon.style.height = hexagon_height + "px";
    hexagon.style.backgroundImage = DISABLED_COLOR
    hexagon.id = hex_id;
    // hexagon.innerText = hex_id
    // hexagon.style.padding = '10px'
    hex_id += 1;
    container.appendChild(hexagon)
}


// Get the div element
const divElement = document.querySelector('.my-div');



const leftMouseClickEvent = function (event) {
    showToast();
    if (!OPPENENT_JOINED) {
        showToast("Opponent not acitve. Please wait ...");
        return;
    }
    if (event.button === 0) {
        addClaim(this)
        // this.style.backgroundImage = CLAIMED_COLOR
        // activateNeighbors(this.id)
        // sendMessage(JSON.stringify({ "id": this.id, 'sender': SOCKET_ID, 'bombed': false }))
    }
}

const rightMouseClickEvent = function (event) {
    if (!OPPENENT_JOINED) {
        showToast("Opponent not acitve. Please wait ...");
        return;
    }
    event.preventDefault();
    addBomb(this);
    // this.style.backgroundImage = BOMB_PLANTED_COLOR
    // var neighbors = getNeighbors(this.id)
    // for (var i = 0; i < neighbors.length; i++) {
    //     if (activateSelf(neighbors[i])) {
    //         neighbor_hexagon.addEventListener('click', leftMouseClickEvent);
    //         neighbor_hexagon.addEventListener('contextmenu', rightMouseClickEvent);
    //         if (this.style.backgroundImage == DISABLED_COLOR) {
    //             this.style.backgroundImage = UNCLAIMED_COLOR
    //         }
    //     }
    //     else {
    //         neighbor_hexagon.removeEventListener('click', leftMouseClickEvent);
    //         neighbor_hexagon.removeEventListener('contextmenu', rightMouseClickEvent);
    //         if (this.style.backgroundImage == UNCLAIMED_COLOR) {
    //             this.style.backgroundImage = DISABLED_COLOR
    //         }
    //     }
    //     sendMessage(JSON.stringify({ "id": this.id, 'sender': SOCKET_ID, 'bombed': true }))
    // }
}


const addBomb = function (div) {
    if (div.style.backgroundImage == LOST_COLOR || div.style.backgroundImage == UNCLAIMED_COLOR) {
        CLAIMED_COUNT = Number(CLAIMED_COUNT) + 1
        updateInformation();
    }
    div.style.backgroundImage = BOMB_PLANTED_COLOR
    var neighbors = getNeighbors(div.id);
    for (var i = 0; i < neighbors.length; i++) {
        activateSelfComplete(neighbors[i][0])
    }

    sendMessage(JSON.stringify({ "id": div.id, 'sender': SOCKET_ID, 'bombed': true }))
}

const addClaim = function (div) {
    if (div.style.backgroundImage == LOST_COLOR || div.style.backgroundImage == UNCLAIMED_COLOR) {
        CLAIMED_COUNT = Number(CLAIMED_COUNT) + 1
        updateInformation();
    }
    div.style.backgroundImage = CLAIMED_COLOR
    var neighbors = getNeighbors(div.id);
    for (var i = 0; i < neighbors.length; i++) {
        activateSelfComplete(neighbors[i][0])
    }
    sendMessage(JSON.stringify({ "id": div.id, 'sender': SOCKET_ID, 'bombed': false }))
}

const addLost = function (div) {
    if (div.style.backgroundImage == DISABLED_COLOR || div.style.backgroundImage == UNCLAIMED_COLOR) {
        LOST_COUNT = Number(LOST_COUNT) + 1;
        updateInformation();
    }
    div.style.backgroundImage = LOST_COLOR
    var neighbors = getNeighbors(div.id);
    for (var i = 0; i < neighbors.length; i++) {
        activateSelfComplete(neighbors[i][0])
    }
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
