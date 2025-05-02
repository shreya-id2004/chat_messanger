import express from 'express';
const app = express();

import http from 'http';
const server = http.createServer(app);

import { Server } from 'socket.io';
import cors from 'cors'; // Add CORS import
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

// Enable CORS for all Express routes
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST'],
}));

import multer from 'multer';
import path from 'path';

//Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req,file,cb) =>{
    cb(null , 'public/uploads');
  },
  filename:(req,file,cb) =>{
    // const ext = path.extname(file.originalname);
    cb(null , `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits:{fileSize:5*1024*1024}, //5MB limit
  fileFilter:(req,file,cb)=>{
    const fileType = /jpeg|jpg|png|gif|pdf/;
    const extName = fileType.test(path.extname(file.originalname).toLowerCase());
    const mimeType = fileType.test(file.mimetype);
    if(extName && mimeType){
      cb(null,true);
    }else{
      cb(new Error('Only image files are allowed'));
    }
  }
})

let users = {}; //{socket.id : {name , roomId}}

app.use(express.static('public'));
app.set('view engine', 'ejs');

//file upload endpoint
app.post('/upload',upload.single('file'),(req,res)=>{
  if(!req.file){
    return res.status(400).json({error:'No file uploaded of invalid file type'});
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({fileUrl , fileType : req.file.mimetype}); //send the file url and type to the client
})

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


  socket.on('send', ({message , roomId,file})=> {
    if (!users[socket.id]) return;
    console.log('message :',message ,'file:',file);

    const payload = {
      message : message ||null ,
      file: file || null,
      name: users[socket.id].name , 
      id: socket.id,
      messageId : `${socket.id}-${Date.now()}`, //unique message ID
      }
    if(roomId){
      socket.to(roomId).emit('receive',payload);
      socket.emit('receive',payload);
      console.log("The msg room :" , payload);
    }
    else{
      socket.to('global').emit('receive',payload);
      socket.emit('receive',payload);
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



