const socket = io();

const form = document.querySelector('#send_container');
const msgInput = document.querySelector('#msgInput');
const msgContainer = document.querySelector(".container");

const append = (message,position)=>{
    const messageElement = document.createElement("div");
    messageElement.innerText = message;
    messageElement.classList.add('msg');
    messageElement.classList.add(position);
    msgContainer.appendChild(messageElement);
}

form.addEventListener('submit',(e)=>{
    e.preventDefault();
    const message = msgInput.value;
    append(`You : ${message}`,'right');
    socket.emit('send',message);
    msgInput.value = '';
})
const name = prompt("Enter your name to join");
socket.emit('new-user-joined' , name );

socket.on('user-joined',(name)=>{
    append(`${name} joined the chat`,'right');
});

socket.on('receive',(data)=>{
    append(`${data.name}: ${data.message}`,'left');
});

socket.on('user-left', (name) => {
    append(`${name} left the chat`, 'left');
})

