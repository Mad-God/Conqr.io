
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

/*
takes id: div id
returns list[]: neighbors of the div(id)
each neighbor in the format: (div-id, topOffset, leftOffset, colour_code)
*/
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



/*
takes id of the hexagonal div

*/
function activateNeighbors(id) {
    var neighbors = getNeighbors(id);
    for (var i = 0; i < neighbors.length; i++) {
        var div = document.getElementById(neighbors[i][0])
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



/* takes the id of the hexagonal div
goes through all the neighbors:
    checks if the code in BOARD_STRING index for the div is friendly
        return true
return false
*/
function activateSelfFromGrid(id, boardString = '') {
    var neighbors = getNeighbors(id);
    for (var i = 0; i < neighbors.length; i++) {
        if (SOCKET_ID == 1 && (boardString[neighbors[i][0]] == '1' || boardString[neighbors[i][0]] == '2')) {
            return true
        }
        else if (SOCKET_ID == 2 && (boardString[neighbors[i][0]] == '4' || boardString[neighbors[i][0]] == '3')) {
            return true
        }
    }

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



/* takes the id of the hexagonal div
goes through all the neighbors:
    checks if the neighbors color is claimed or bombed
        return true
return false
*/
function activateSelf(id) {
    var neighbors = getNeighbors(id);
    for (var i = 0; i < neighbors.length; i++) {
        var neighbor_ele = document.getElementById(neighbors[i][0])
        if (neighbor_ele.style.backgroundImage == CLAIMED_COLOR || neighbor_ele.style.backgroundImage == BOMB_PLANTED_COLOR) {
            return true;
        }
    }
    return false
}


function activateSelfComplete(id) {
    var div = document.getElementById(id)
    if (div.style.backgroundImage == LOST_COLOR) {
        if (activateSelf(id)) {
            div.addEventListener('click', leftMouseClickEvent);
            div.addEventListener('contextmenu', rightMouseClickEvent);
        }
        else {
            div.removeEventListener('click', leftMouseClickEvent);
            div.removeEventListener('contextmenu', rightMouseClickEvent);
        }
    }
    else if (div.style.backgroundImage != UNCLAIMED_COLOR && div.style.backgroundImage != DISABLED_COLOR) {
        return;
    }
    else {
        if (activateSelf(id)) {
            div.style.backgroundImage = UNCLAIMED_COLOR
            div.addEventListener('click', leftMouseClickEvent);
            div.addEventListener('contextmenu', rightMouseClickEvent);
        }
        else {
            div.style.backgroundImage = DISABLED_COLOR
            div.removeEventListener('click', leftMouseClickEvent);
            div.removeEventListener('contextmenu', rightMouseClickEvent);
        }
    }
}