let socket = new ReconnectingWebSocket("ws://" + location.host + "/ws");

socket.onclose = event => {
    console.log("Socket Closed Connection: ", event);
    socket.send("Client Closed!");
};

socket.onerror = error => console.log("Socket Error: ", error);

let DEBUG = false;

socket.onmessage = event => {
    let data = JSON.parse(event.data);
}