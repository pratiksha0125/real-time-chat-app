// client/src/pages/chat/index.js
import styles from './styles.module.css';
import MessagesReceived from './messages';
import SendMessage from './send-message';
import RoomAndUsersColumn from './room-and-users';
import { useEffect } from 'react'; // Add this import

const Chat = ({ username, room, socket }) => {
  // Add this useEffect to handle room joining/rejoining
  useEffect(() => {
    if (username && room) {
      socket.emit('join_room', { username, room });
    }
    
    return () => {
      // Cleanup when component unmounts
      socket.off('last_100_messages');
      socket.off('receive_message');
      socket.off('chatroom_users');
    };
  }, [socket, username, room]);

  return (
    <div className={styles.chatContainer}>
      <RoomAndUsersColumn socket={socket} username={username} room={room} />

      <div>
        <MessagesReceived socket={socket} />
        <SendMessage socket={socket} username={username} room={room} />
      </div>
    </div>
  );
};

export default Chat;