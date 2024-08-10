const express = require("express");
const app = express();

const server = require('http').createServer(app); 
const io = require('socket.io')(server);


let users={}; //define the user object;

server.listen("8080",() => {
    console.log("server is listening to port 8080");
 });

io.on("connection",socket =>{
    socket.on('new-user-joined',name=>{
        console.log("new user",name);
        users[socket.id] = name;
        socket.broadcast.emit('user-joined',name);
    });

    socket.on('send', message => {
        socket.broadcast.emit('receive', { message: message, name: users[socket.id] })
      });

    socket.on('disconnect', () => {
        socket.broadcast.emit('user-left', users[socket.id]);
        delete users[socket.id];
      });
})

 app.get("/user",(req,res)=>{
    console.log("it is working");
    res.render("index.ejs");
});

