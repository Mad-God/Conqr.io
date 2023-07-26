
const addBomb = function (div) {
    if (BOMB_COUNT <= 0) {
        showToast("Bombs not available !")
        return;
    }
    // if (div.style.backgroundImage != CLAIMED_COLOR && div.style.backgroundImage != BOMB_PLANTED_COLOR) {
    //     CLAIMED_COUNT = Number(CLAIMED_COUNT) + 1
    //     if (div.style.backgroundImage == LOST_COLOR) {
    //         LOST_COUNT -= 1
    //     }
    // }
    // if (div.style.backgroundImage != BOMB_PLANTED_COLOR) {
    //     BOMB_COUNT -= 1;
    // }
    div.style.backgroundImage = BOMB_PLANTED_COLOR
    var neighbors = getNeighbors(div.id);
    for (var i = 0; i < neighbors.length; i++) {
        activateSelfComplete(neighbors[i][0])
    }
    sendMessage(JSON.stringify({ "id": div.id, 'sender': SOCKET_ID, 'bombed': true }))
    updateInformation();
}


const addClaim = function (div) {
    // if (div.style.backgroundImage == LOST_COLOR) {
    //     CLAIMED_COUNT = Number(CLAIMED_COUNT) + 1
    //     LOST_COUNT -= 1
    //     updateInformation();
    // }
    // else if (div.style.backgroundImage == BOMB_PLANTED_COLOR) {
    //     BOMB_COUNT += 1
    //     updateInformation();
    // }
    div.style.backgroundImage = CLAIMED_COLOR
    var neighbors = getNeighbors(div.id);
    for (var i = 0; i < neighbors.length; i++) {
        activateSelfComplete(neighbors[i][0])
    }
    sendMessage(JSON.stringify({ "id": div.id, 'sender': SOCKET_ID, 'bombed': false }))
    updateInformation();
}



const addLost = function (div, is_bombed = false) {
    if (div.style.backgroundImage == BOMB_PLANTED_COLOR) {
        if (is_bombed) {
            neutralExplode(div)
        }
        else {
            bombExplode(div)
        }
        return
    }
    // if (div.style.backgroundImage != LOST_COLOR) {
    //     LOST_COUNT = Number(LOST_COUNT) + 1;
    //     if (div.style.backgroundImage == CLAIMED_COLOR || div.style.backgroundImage == BOMB_PLANTED_COLOR) {
    //         CLAIMED_COUNT -= 1;
    //     }
    // }
    div.style.backgroundImage = LOST_COLOR
    var neighbors = getNeighbors(div.id);
    for (var i = 0; i < neighbors.length; i++) {
        activateSelfComplete(neighbors[i][0])
    }
    updateInformation();
}



const neutraliseDiv = function (div, is_bombed = false) {
    console.log("nutralising div: ", div.id, div)
    // if (div.style.backgroundImage == LOST_COLOR) {
    //     LOST_COUNT = Number(LOST_COUNT) - 1;
    // }
    // else if (div.style.backgroundImage == CLAIMED_COLOR || div.style.backgroundImage == BOMB_PLANTED_COLOR) {
    //     CLAIMED_COUNT = Number(CLAIMED_COUNT) - 1;
    // }
    div.style.backgroundImage = DISABLED_COLOR
    // activateSelfComplete(div.id)
    if (is_bombed) {
        sendMessage(JSON.stringify({ "type": 'neutralise', 'sender': SOCKET_ID, 'id': div.id }))
    }
    updateInformation()
}


function neutralExplode(div) {
    showToast("Bombs Collided !")
    neutraliseDiv(div = div, is_bombed = true);

    var neighbors = getNeighbors(div.id)
    for (var i = 0; i < neighbors.length; i++) {
        var neighbor_div = document.getElementById(neighbors[i][0])
        neutraliseDiv(div = neighbor_div, is_bombed = true)
    }
    for (var i = 0; i < neighbors.length; i++) {
        var neighbor_div = document.getElementById(neighbors[i][0])
        activateSelfComplete(neighbor_div.id)
    }
    activateSelfComplete(div.id)
}



function bombExplode(div) {
    showToast("Bomb Exploded")
    addClaim(div)

    var neighbors = getNeighbors(div.id)
    for (var i = 0; i < neighbors.length; i++) {
        var neighbor_div = document.getElementById(neighbors[i][0])
        if (neighbor_div.style.backgroundImage == BOMB_PLANTED_COLOR) {
            addBomb(document.getElementById(neighbors[i][0]))
        }
        else {
            addClaim(neighbor_div)
        }
    }
}


function syncBombs() {
    if (!OPPENENT_JOINED) {
        return;
    }
    sendMessage(JSON.stringify({ "type": 'bomb-sync', 'sender': SOCKET_ID, 'bomb_count': BOMB_COUNT }))
}



function issueBomb() {
    if (!OPPENENT_JOINED) {
        return;
    }
    try {
        if (socket)
            BOMB_COUNT += 1
        updateInformation()
    }
    catch (e) {
        console.log("Couldn't issue bomb")
    }
}





// setInterval(issueBomb, ISSUE_RATE * 1000)

// setInterval(syncBombs, 1000);