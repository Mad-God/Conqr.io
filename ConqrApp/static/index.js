// Add click event listeners to each button
document.getElementById('join').querySelector('button').addEventListener('click', function () {
    var lobby_id = document.getElementById('join').querySelector('input').value;
    var lobby = getLobby({ 'type': "join", 'room_id': lobby_id });
});

document.getElementById('spectate').querySelector('button').addEventListener('click', function () {
    var lobby = getLobby({ 'type': "spectate" });
});

document.getElementById('vs-ai').querySelector('button').addEventListener('click', function () {
    var lobby = getLobby({ 'type': "vs-ai" });
});

document.getElementById('vs-player').querySelector('button').addEventListener('click', function () {
    var lobby = getLobby({ 'type': "create" });
    // if
    // console.log(lobby)
    // goToLobby(lobby);
});
function goToLobby(lobby) {
    var domain = window.location.origin.split('/')[2]
    console.log(domain, "/join-lobby?room_id=", lobby)
    window.location.replace("/join-lobby?room_id=" + lobby);
}



function getLobby(params) {
    var queryString = Object.keys(params).map(key => key + '=' + encodeURIComponent(params[key])).join('&');
    var url = '/get-lobby-id/?' + queryString;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            // Process the returned data
            console.log(data);
            if ("room_id" in data) {
                if (data["room_id"] != undefined) {
                    var lobby = data["room_id"]
                    console.log(lobby)
                    goToLobby(lobby)
                }
                else {
                    showToast("Room Not Valid")
                    console.log("room invalid")
                }
            }
        })
        .catch(error => {
            // Handle any errors
            console.error(error);
        });

}

