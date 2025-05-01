import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import io from 'socket.io-client';
import Home from './Components/Home.jsx';
import Chat from './Components/Chat.jsx';

const socket = io('http://localhost:8080')

function App() {
 
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/chat" element={<Chat socket={socket}/>} />
        <Route path="/chat/:roomId" element={<Chat socket={socket} />} />
      </Routes>
    </Router>
  );
}

export default App
