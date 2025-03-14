import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import '../styles/ChatPage.css';

// Material-UI imports
import {
  Box,
  TextField,
  IconButton,
  Paper,
  Typography,
  Button
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import MoreVertIcon from '@mui/icons-material/MoreVert'; // For 3-dot menu

// Markdown + code highlighting
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';

const ChatPage = () => {
  /************************************************
   * Sidebar state: list of chat titles.
   * In a real app, you’d store each chat’s messages.
   ************************************************/
  const [chats, setChats] = useState([
    { id: 1, title: 'Chat 1' },
    { id: 2, title: 'Chat 2' }
  ]);

  // Currently selected chat ID (if any)
  const [activeChatId, setActiveChatId] = useState(null);

  /************************************************
   * Chat state: messages for the selected chat
   ************************************************/
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /************************************************
   * Sidebar handlers: new chat, clear, edit, delete
   ************************************************/
  const createNewChat = () => {
    // In a real app, you'd also store messages etc.
    const newId = Date.now();
    const newChat = { id: newId, title: `New Chat ${newId}` };
    setChats((prev) => [...prev, newChat]);
    setActiveChatId(newId);
    setMessages([]); // Clear the message panel for new chat
  };

  const clearAllChats = () => {
    setChats([]);
    setActiveChatId(null);
    setMessages([]);
  };

  const selectChat = (chatId) => {
    setActiveChatId(chatId);
    // In a real app, you'd load that chat's messages.
    // For now, we’ll just clear or do something placeholder.
    setMessages([]);
  };

  const editChatTitle = (chatId) => {
    const newTitle = prompt('Enter new chat title:');
    if (!newTitle) return;
    setChats((prevChats) =>
      prevChats.map((c) => (c.id === chatId ? { ...c, title: newTitle } : c))
    );
  };

  const deleteChat = (chatId) => {
    setChats((prev) => prev.filter((c) => c.id !== chatId));
    // If you deleted the active chat, reset it
    if (activeChatId === chatId) {
      setActiveChatId(null);
      setMessages([]);
    }
  };

  /************************************************
   * Chat code
   ************************************************/
  // Renders code blocks in Markdown
  const renderMessageContent = (content) => {
    return (
      <ReactMarkdown
        children={content}
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <SyntaxHighlighter language={match[1]} PreTag="div" {...props}>
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          }
        }}
      />
    );
  };

  // Send message
  const handleSend = async () => {
    if (!newMessage.trim()) return;
    setLoading(true);

    try {
      // Add user message
      setMessages((prev) => [...prev, { role: 'user', content: newMessage }]);

      // Call LLM API
      const res = await axios.post('http://127.0.0.1:7860/llama_predict',
        { user_message: newMessage },
        { headers: { 'Content-Type': 'application/json' } }
      );

      // Insert the bot reply
      setMessages((prev) => [
        ...prev,
        { role: 'bot', content: res.data.bot_reply }
      ]);

      setNewMessage('');
      setError(null);
    } catch (err) {
      console.error('Error sending message:', err);
      setError(`Failed to send message: ${err.response?.data?.detail || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-container">
      {/* SIDEBAR */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>Chats</h2>
          <Button variant="contained" size="small" onClick={createNewChat}>
            New Chat
          </Button>
        </div>

        <div className="chat-list">
          {chats.map((chat) => (
            <div
              key={chat.id}
              className={`chat-item ${chat.id === activeChatId ? 'active-chat' : ''}`}
              onClick={() => selectChat(chat.id)}
            >
              <span className="chat-item-title">{chat.title}</span>
              <IconButton
                className="dots-button"
                size="small"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent selecting chat
                }}
              >
                <MoreVertIcon />
              </IconButton>

              {/* 
                A simple absolute menu or "3-dot" popover could appear here.
                For demonstration, we'll just do direct calls:
              */}
              <div className="chat-item-menu">
                <button onClick={() => editChatTitle(chat.id)}>Edit</button>
                <button onClick={() => deleteChat(chat.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>

        <div className="sidebar-footer">
          <Button variant="text" color="error" onClick={clearAllChats}>
            Clear All Chats
          </Button>
        </div>
      </div>

      {/* CHAT PANEL */}
      <div className="chat-wrapper">
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
            {messages.length === 0 ? (
              <Typography variant="body2" sx={{ textAlign: 'center', color: 'gray' }}>
                No messages yet. Start the conversation!
              </Typography>
            ) : (
              messages.map((msg, idx) => (
                <Box
                  key={idx}
                  className={`message-bubble ${msg.role === 'user' ? 'user-message' : 'bot-message'}`}
                >
                  {renderMessageContent(msg.content)}
                </Box>
              ))
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
      </div>
    </div>
  );
};

export default ChatPage;
