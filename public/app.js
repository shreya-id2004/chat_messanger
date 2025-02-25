const socket = io();

const form = document.querySelector('#send_container');
const msgInput = document.querySelector('#msgInput');
const msgContainer = document.querySelector(".container");
const typingIndicator = document.getElementById('typing-indicator');
let typingTimeout;

const append = (message,position)=>{
    const messageElement = document.createElement("div");
    messageElement.innerText = `${message}`;
    messageElement.classList.add('msg');
    messageElement.classList.add(position);
    msgContainer.appendChild(messageElement);
    msgContainer.scrollTop = msgContainer.scrollHeight;
}

//client -side 
form.addEventListener('submit',(e)=>{
    e.preventDefault();
    const message = msgInput.value.trim();
    if(message === '') return;
    append(`You : ${message}`,'right');
    socket.emit('send',message);
    msgInput.value = '';
    socket.emit('stop-typing');
});

// let name = prompt("Enter your name to join");
// socket.emit('new-user-joined' , name );

socket.on('user-joined',(name)=>{
    append(`${name} joined the chat`,'right');
});

msgInput.addEventListener('input', () => {
    if (msgInput.value.trim() !== '') {
        socket.emit('typing');
        clearTimeout(typingTimeout);
        typingTimeout = setTimeout(() => {
            socket.emit('stop-typing'); 
        }, 2000);
    } else {
        socket.emit('stop-typing');
    }
});



// Handle when another user is typing
socket.on('user-typing', (data) => {
    if (data.id !== socket.id) {
        typingIndicator.innerHTML = `${data.name} is typing... <span></span>`;
        typingIndicator.classList.add('active');
    }
});

socket.on('user-stopped-typing',(data)=>{
    if(data.id !== socket.id){
        typingIndicator.classList.remove('active');
    }
})

socket.on('receive',(data)=>{
    append(`${data.name}: ${data.message}`,'left');
});

socket.on('user-left', (name) => {
    append(`${name} left the chat`, 'left');
})

