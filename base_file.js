const express = require("express");
const app = express();
const server = require('http').createServer(app); 
const io = require('socket.io')(server);


let users={}; //define the user object;

app.use(express.static("public"));
app.set("view engine",'ejs');

//server side
io.on("connection",socket =>{

    socket.on('new-user-joined',name=>{
        if(!name || name.trim() === ''){
            return socket.emit('invalid-name');
        }
        console.log("new user",name);
        users[socket.id] = name;
        console.log("users",users[socket.id])
        socket.broadcast.emit('user-joined',name);
    });

    socket.on('send', message => {
        socket.broadcast.emit('receive', { message: message, name: users[socket.id] })
    });

    socket.on('typing',()=>{
        socket.broadcast.emit('user-typing',{ name : users[socket.id] , id:socket.id } );
    });

    socket.on('stop-typing', () => {
        socket.broadcast.emit('user-stopped-typing', { id: socket.id });
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

server.listen("8080",() => {
    console.log("server is listening to port 8080");
 });



