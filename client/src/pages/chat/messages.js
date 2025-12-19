// client/src/pages/chat/messages.js
import styles from './styles.module.css';
import { useState, useEffect, useRef } from 'react';

const Messages = ({ socket }) => {
  const [messagesRecieved, setMessagesReceived] = useState([]);
  const messagesColumnRef = useRef(null);

  // 🔹 Receive message history
  useEffect(() => {
    const handleLastMessages = (messages) => {
      console.log('Received last messages:', messages);
      
      // Ensure messages is an array
      if (!Array.isArray(messages)) {
        messages = [];
      }
      
      // Sort by time
      messages.sort(
        (a, b) => parseInt(a.__createdtime__) - parseInt(b.__createdtime__)
      );

      setMessagesReceived(messages);
    };

    socket.on('last_100_messages', handleLastMessages);

    return () => socket.off('last_100_messages', handleLastMessages);
  }, [socket]);

  // 🔹 Receive live messages (welcome + chat)
  useEffect(() => {
    const handleReceiveMessage = (data) => {
      console.log('Received live message:', data);
      setMessagesReceived((prev) => [...prev, data]);
    };

    socket.on('receive_message', handleReceiveMessage);

    return () => socket.off('receive_message', handleReceiveMessage);
  }, [socket]);

  // 🔹 Auto-scroll
  useEffect(() => {
    if (messagesColumnRef.current) {
      messagesColumnRef.current.scrollTop =
        messagesColumnRef.current.scrollHeight;
    }
  }, [messagesRecieved]);

  function formatDateFromTimestamp(timestamp) {
    const date = new Date(timestamp);
    // Check if timestamp is valid
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    return date.toLocaleString();
  }

  return (
    <div className={styles.messagesColumn} ref={messagesColumnRef}>
      {messagesRecieved.map((msg, i) => (
        <div className={styles.message} key={i}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span className={styles.msgMeta}>{msg.username}</span>
            <span className={styles.msgMeta}>
              {formatDateFromTimestamp(msg.__createdtime__)}
            </span>
          </div>
          <p className={styles.msgText}>{msg.message}</p>
        </div>
      ))}
    </div>
  );
};

export default Messages;