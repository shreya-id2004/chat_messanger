import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Container, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemText, IconButton } from '@mui/material';
import Message from './Message';
import TypingIndicator from './TypingIndicator';
import MessageForm from './MessageForm';

function ChatContainer({ socket }) {
  const { roomId: paramRoomId } = useParams();
  const [messages, setMessages] = useState([]);
  const [typingUser, setTypingUser] = useState(null);
  const [userName, setUserName] = useState('');
  const [roomId , setRoomId] = useState('');
  const msgContainerRef = useRef(null);
  const typingTimeout = useRef(null);

  const appendMessage = (message, position, messageId, file) => {
    setMessages((prev) => [...prev, { text: message, position, messageId, reactions: [], file }]);
  };

  useEffect(() => {
    // Set up the user name and initial connection
    const name = prompt('Enter your name to join');
    if (!name || name.trim() === '') {
      alert('The name is required');
      return;
    };

    let room = paramRoomId || null;
    if (!paramRoomId) {
      room = prompt('Enter room ID to join a private room (leave blank for global chat)') || null;
    }
    
    setUserName(name);
    setRoomId(room);
    socket.emit('new-user-joined', {name , roomId : room || null});
    console.log("new user joined",name);

    // Connection status listeners
    socket.on('connect', () => console.log('Connected to Server'));
    socket.on('connect_error', (err) => {
      console.log('Error connecting to server', err);
    });

    // Chat event listeners
    socket.on('user-joined', (name) => {
      console.log("user joined from other side", name);
      appendMessage(`${name} joined the chat`, 'right');
    });

    socket.on('receive', (data) => {
      console.log("The reviced message is" , data.message,data.file);
      const position = data.id === socket.id ? 'right' : 'left';
      appendMessage(`${data.name}: ${data.message || ''}`, position, data.messageId, data.file);
    });

    socket.on('user-left', (name) => {
      appendMessage(`${name} left the chat`, 'left');
    });

    socket.on('user-typing', (data) => {
      if (data.id !== socket.id) {
        setTypingUser(data.name);
      }
    });

    socket.on('user-stopped-typing', (data) => {
      if (data.id !== socket.id) {
        setTypingUser(null);
      }
    });

    // Cleanup function
    return () => {
      console.log('Cleaning up socket listeners');
      socket.off('connect');
      socket.off('connect_error');
      socket.off('user-joined');
      socket.off('receive');
      socket.off('user-left');
      socket.off('user-typing');
      socket.off('user-stopped-typing');
      if (typingTimeout.current) {
        clearTimeout(typingTimeout.current);
      }
    };
  }, [socket]);

  useEffect(() => {
    if (msgContainerRef.current) {
      msgContainerRef.current.scrollTop = msgContainerRef.current.scrollHeight;
    }
  }, [messages]);

  
  const handleSendMessage = (message ,file) => {
    console.log('Sending message:', message , 'File:',file);
    // appendMessage(`You: ${message}`, 'right' ,`${socket.id}-${Date.now()}`,file);
    socket.emit('send',({ message , roomId,file}));
    socket.emit('stop-typing', roomId);
  };

  const handleTyping = (inputValue) => {
    if (inputValue.trim() !== '') {
      socket.emit('typing' , roomId);
      clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(() => {
        socket.emit('stop-typing',roomId);
      }, 2000);
    } else {
      socket.emit('stop-typing' , roomId);
    }
  };

  return (
    <Container maxWidth="md" sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Box
        ref={msgContainerRef}
        sx={{
          flex: 1,
          overflowY: 'auto',
          padding: 2,
          bgcolor: '#fafafa',
        }}
      >
        {messages.map((msg, index) => (
          <Message 
            key={index} 
            text={msg.text} 
            position={msg.position} 
            file={msg.file}/>
        ))}
      </Box>
      <TypingIndicator typingUser={typingUser} />
      <MessageForm onSend={handleSendMessage} onTyping={handleTyping} />
    </Container>
  );
}

export default ChatContainer;