import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  const goToChat = () => {
    navigate('/chat');
  };

  return (
    <div>
      <h1>Welcome to the Chat App</h1>
      <button onClick={goToChat}>Go to Chat</button>
    </div>
  );
};

export default Home;