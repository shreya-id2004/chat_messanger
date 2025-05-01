import express from 'express';
const app = express();

import http from 'http';
const server = http.createServer(app);

import { Server } from 'socket.io';
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

let users = {}; //{socket.id : {name , roomId}}

app.use(express.static('public'));
app.set('view engine', 'ejs');


io.on('connection', (socket) => {
  console.log('Client Connected', socket.id);

  socket.on('new-user-joined', ({name , roomId}) => {
    if (!name || name.trim() === '') {
      return socket.emit('invalid-name' , 'Name is required');
    }
    users[socket.id] = {name , roomId : roomId || null};
    if(roomId){
      socket.join(roomId);
      console.log('users joined to privet room', users);
      socket.to(roomId).emit('user-joined' , name);
    }
    else{
      socket.join('global');
      console.log('users joined to golbal room', users);
      socket.to('global').emit('user-joined', name);
    }
    
  });


  socket.on('send', ({message , roomId})=> {
    if (!users[socket.id]) return;
    console.log('message :',message);

    const payload = {
      message : message ,
       name:users[socket.id].name , 
       id:socket.id,
       messageId : `${socket.id}-${Date.now()}`, //unique message ID
      }
    if(roomId){
      socket.to(roomId).emit('receive',payload);
      console.log("The msg room :" , payload);
    }
    else{
      socket.to('global').emit('receive',payload);
      console.log("The msg common:" , payload);
    }
    
  });


  socket.on('typing', (roomId) => {
    if (!users[socket.id]) return;
    const payload = {name : users[socket.id].name , id:socket.id};
    if(roomId){
      socket.to(roomId).emit('user-typing',payload);
    }
    else{
      socket.to('global').emit('user-typing',payload);
    }
  });

  socket.on('stop-typing', (roomId) => {
    const payload = {id : socket.id};
    if(roomId){
      socket.to(roomId).emit('user-stopped-typing',payload);
    }
    else{
      socket.to('global').emit('user-stopped-typing',payload);
    }
  });

  socket.on('connect', () => {
    console.log('Connected with ID:', socket.id);
  });

  socket.on('disconnect', () => {
    if (users[socket.id]) {
      const {name , roomId} = users[socket.id];
      if(roomId){
        console.log(`${name} left  the room : ${roomId}`);
        socket.to(roomId).emit('user-left', name);
      }
      else{
        socket.to('global').emit('user-left', name);
        console.log('User disconnected: The chat',name);
      }
      delete users[socket.id];
    }
  });
});

server.listen(8080, () => {
  console.log('server is listening to port 8080');
});



