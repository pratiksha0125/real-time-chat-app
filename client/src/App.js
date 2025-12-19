// client/src/App.js
import './App.css';
import { useState, useEffect } from 'react'; // Add useEffect here
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import io from 'socket.io-client';
import Home from './pages/Home';
import Chat from './pages/chat';

// Create socket instance
const socket = io.connect('http://localhost:4000', {
  autoConnect: true,
  transports: ['websocket', 'polling']
});

function App() {
  const [username, setUsername] = useState('');
  const [room, setRoom] = useState('');

  // Socket connection status
  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to server:', socket.id);
    });

    socket.on('connect_error', (err) => {
      console.log('Connection error:', err);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    // Cleanup
    return () => {
      socket.off('connect');
      socket.off('connect_error');
      socket.off('disconnect');
    };
  }, []);

  return (
    <Router>
      <div className='App'>
        <Routes>
          <Route
            path='/'
            element={
              <Home
                username={username}
                setUsername={setUsername}
                room={room}
                setRoom={setRoom}
                socket={socket}
              />
            }
          />
          <Route
            path='/chat'
            element={<Chat username={username} room={room} socket={socket} />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;