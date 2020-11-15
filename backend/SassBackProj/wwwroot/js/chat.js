
var lista = document.getElementById('id_lista');
var btn_connect = document.getElementById('connect');
var address = 'ws://localhost:5000';
var input_ = document.getElementById('input_mess');
var btn_send = document.getElementById('send');
var btn_close = document.getElementById('close');
var socket;




btn_close.addEventListener('click',(event) => {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
        ListAppend("Socket Not Connected YET");
    } else {
        socket.close(1000, "Closing from client");
    }

})

btn_connect.addEventListener('click', (event) => {
    ListAppend('Trying To Connect ->' + address);
    socket = new WebSocket(address);

    socket.onopen = function (event) {
        ListAppend('WS Connected');
    };
    socket.onclose = function (event) {
        ListAppend('WS Closed => ' + event.reason);
    };
    socket.onerror = function (event) {
        ListAppend('WS Error');
    };
    socket.onmessage = function (event) {
        ListAppend('WS NEW Message -> ' + event.data);
    };
});

btn_send.addEventListener('click', (event) => {
    ListAppend('Trying To SEND ->' + input_.value);
    if (!socket || socket.readyState !== WebSocket.OPEN) {
        ListAppend("socket not connected");
    }
    {
        var data = input_.value;
        socket.send(data);
        ListAppend("Wyslano" + input_.value);

        input_.value = '';
    }
});


function ListAppend(text) {
    var li_element = document.createElement('li');
    li_element.innerText = text;
    lista.appendChild(li_element);
}


