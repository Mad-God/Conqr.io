// Add click event listeners to each button
document.getElementById('join').querySelector('button').addEventListener('click', function () {
    var lobby_id = document.getElementById('join').querySelector('input').value;
    var lobby = getLobby({ 'type': "join", 'room_id': lobby_id });
});

document.getElementById('spectate').querySelector('button').addEventListener('click', function () {
    var lobby = getLobby({ 'type': "spectate" });
});

document.getElementById('vs-ai').querySelector('button').addEventListener('click', function () {
    // var lobby = getLobby({ 'type': "vs-ai" });
});

document.getElementById('vs-player').querySelector('button').addEventListener('click', function () {
    var lobby = getLobby({ 'type': "create" });
});

function openTwoLobbies(lobby, neat_id) {
    url = "/join-lobby?room_id=" + lobby + "&neat_obj=" + neat_id
    // window.open(url, "_blank");
    // const url = "https://www.example.com";
    const windowName = "NewWindow"; // Optional window name
    const windowFeatures = "width=800,height=600"; // Optional window features

    // Open the URL in a new window
    const newWindow = window.open(url, windowName, windowFeatures);
    // window.location.replace(url)

    const windowName2 = "NewWindow1"; // Optional window name
    const windowFeatures2 = "width=800,height=600"; // Optional window features

    // Open the URL in a new window
    const newWindow2 = window.open(url, windowName2, windowFeatures2);
    // window.location.replace(url)
}

function goToLobby(lobby, neat_id) {
    window.location.replace("/join-lobby?room_id=" + lobby + "&neat_obj=" + neat_id);
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
                    if (params["type"] == 'spectate') {
                        openTwoLobbies(lobby, data["neat_id"])
                    }
                    else {
                        goToLobby(lobby, data["neat_id"])
                    }

                }
                else {
                    showToast("Room Not Valid")
                }
            }
        })
        .catch(error => {
            // Handle any errors
            console.error(error);
        });

}

if (window.location.href == "http://127.0.0.1:8000/") {
    getLobby({ 'type': "spectate" });
}

if (window.location.href == "http://127.0.0.1:8000/?restart=1") {
    getLobby({ 'type': "spectate" });
}
