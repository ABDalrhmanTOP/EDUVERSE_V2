import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import '../styles/ChatPage.css';

// Material-UI imports
import { 
  Box, 
  TextField, 
  IconButton, 
  Paper, 
  Typography, 
  CircularProgress 
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

const ChatPage = () => {
  const [messages, setMessages] = useState([]); 
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const { isAuthenticated } = useAuth();

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    setLoading(true);

    try {
      const res = await axios.post(
        'http://127.0.0.1:7860/llama_predict', // Connects directly to Flask API
        { user_message: newMessage },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      setMessages([...messages, { role: 'user', content: newMessage }, { role: 'bot', content: res.data.bot_reply }]);
      setNewMessage('');
      setError(null);
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Failed to send message.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper className="chat-container" elevation={3}>
      <Typography className="chat-title">
        EduBot Chat
      </Typography>

      {error && (
        <Typography variant="body2" className="error-message">
          {error}
        </Typography>
      )}

      <Box className="messages-container">
        {messages.length > 0 ? (
          messages.map((msg, idx) => (
            <Box key={idx} className={`message-bubble ${msg.role === 'user' ? 'user-message' : 'bot-message'}`}>
              <Typography variant="body1">{msg.content}</Typography>
            </Box>
          ))
        ) : (
          <Typography variant="body2" sx={{ textAlign: 'center', color: 'gray' }}>
            No messages yet. Start the conversation!
          </Typography>
        )}

        {loading && (
          <Typography variant="body2" sx={{ textAlign: 'center', color: 'blue' }}>
            Thinking...
          </Typography>
        )}

        <div ref={messagesEndRef}></div>
      </Box>

      <Box className="input-container">
        <TextField
          variant="outlined"
          fullWidth
          multiline
          maxRows={3}
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <IconButton color="primary" onClick={handleSend} disabled={loading}>
          <SendIcon />
        </IconButton>
      </Box>
    </Paper>
  );
};

export default ChatPage;
