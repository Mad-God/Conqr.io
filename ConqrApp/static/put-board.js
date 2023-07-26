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
var BOMB_COUNT = 0
const ISSUE_RATE = 10


function getClaimCount() {
    var claim_count = 0
    var lost_count = 0

    for (var i = 0; i < GRID.length; i++) {
        for (var j = 0; j < GRID[i].length; j++) {
            var div_element = document.getElementById(GRID[i][j][0])
            if (div_element.style.backgroundImage == LOST_COLOR) {
                lost_count += 1
            }
            else if (div_element.style.backgroundImage == CLAIMED_COLOR || div_element.style.backgroundImage == BOMB_PLANTED_COLOR) {
                claim_count += 1
            }
        }
    }
    return [claim_count, lost_count]
}



function updateInformation() {
    var local_count = getClaimCount()
    var claim_count = document.getElementById("claim-info")
    claim_count.innerText = claim_count.innerText.split(":")[0] + `: ${local_count[0]}`;
    // var local_lost_count = getLostCount()
    var lost_count = document.getElementById("lost-info")
    lost_count.innerText = lost_count.innerText.split(":")[0] + `: ${local_count[1]}`;
    var player_count = document.getElementById("player-info")
    player_count.innerText = player_count.innerText.split(":")[0] + `: ${SOCKET_ID}`;
    var bomb_count = document.getElementById("bomb-info")
    bomb_count.innerText = bomb_count.innerText.split(":")[0] + `: ${BOMB_COUNT}`;
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
    hexagon.innerText = hex_id
    hexagon.style.padding = '10px'
    hex_id += 1;
    container.appendChild(hexagon)
}


// Get the div element
const divElement = document.querySelector('.my-div');



const leftMouseClickEvent = function (event) {
    if (!OPPENENT_JOINED) {
        showToast("Opponent not acitve. Please wait ...");
        return;
    }
    if (event.button === 0) {
        addClaim(this)
    }
}

const rightMouseClickEvent = function (event) {
    if (!OPPENENT_JOINED) {
        showToast("Opponent not acitve. Please wait ...");
        return;
    }
    event.preventDefault();
    addBomb(this);
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



setInterval(issueBomb, ISSUE_RATE * 1000)

setInterval(syncBombs, 1000);



function showGameOverModal(lost) {
    if (lost) {
        showPopUp("You lose :(")
    }
    else {
        showPopUp("You Win !!")
    }
}

function showPopUp(textContent) {
    // Create the pop-up container
    const popUpContainer = document.createElement("div");
    popUpContainer.style.position = "fixed";
    popUpContainer.style.top = "50%";
    popUpContainer.style.left = "50%";
    popUpContainer.style.transform = "translate(-50%, -50%)";
    popUpContainer.style.padding = "20px";
    popUpContainer.style.backgroundColor = "#fff";
    popUpContainer.style.borderRadius = "5px";
    popUpContainer.style.boxShadow = "0 2px 5px rgba(0, 0, 0, 0.3)";
    popUpContainer.style.zIndex = "9999";
    popUpContainer.style.textAlign = "center";

    // Create the message element
    const message = document.createElement("p");
    message.style.color = "initial";
    message.textContent = textContent;
    message.style.marginBottom = "20px";

    // Create the button element
    const button = document.createElement("button");
    button.textContent = "Menu";
    button.style.padding = "8px 20px";
    button.style.backgroundColor = "#007bff";
    button.style.border = "none";
    button.style.borderRadius = "4px";
    button.style.cursor = "pointer";
    button.href = "/";

    // Append message and button to the container
    popUpContainer.appendChild(message);
    popUpContainer.appendChild(button);

    // Add an event listener to the button to close the pop-up when clicked
    button.addEventListener("click", function () {
        popUpContainer.style.display = "none";
    });

    // Append the pop-up container to the document body
    document.body.appendChild(popUpContainer);

    setTimeout(() => {
        window.location.replace("/")
    }, 5000)
}

// Call the function to show the pop-up dialog
// showPopUp();
