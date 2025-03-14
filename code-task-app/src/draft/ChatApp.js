// src/pages/ChatApp.js
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import '../styles/ChatApp.css';
import SidebarIcon from '../assets/sidebar-left-svgrepo-com.svg';
// Material-UI imports
// Material-UI imports
import {
  Box,
  TextField,
  IconButton,
  Paper,
  Typography,
  Button,
  Menu,
  MenuItem
} from '@mui/material';
import {
  Send,
  Add,
  ChatBubbleOutline,
  MoreHoriz
} from '@mui/icons-material';

// Markdown + code highlighting
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';

const ChatApp = () => {
  // State management
  const [chats, setChats] = useState([
    { id: 1, title: 'Chat 1', messages: [] },
    { id: 2, title: 'Chat 2', messages: [] }
  ]);
  const [activeChatId, setActiveChatId] = useState(chats[0]?.id || null);
  const [activeMessages, setActiveMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingChatId, setEditingChatId] = useState(null);
  const [editedTitle, setEditedTitle] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const messagesEndRef = useRef(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Refs and menu state
  const openMenu = Boolean(anchorEl);

  // Effects
  useEffect(() => {
    const chat = chats.find((c) => c.id === activeChatId);
    setActiveMessages(chat ? chat.messages : []);
  }, [activeChatId, chats]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages]);

  // Handlers
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const createNewChat = () => {
    const newId = Date.now();
    const newChat = { id: newId, title: `New Chat ${newId}`, messages: [] };
    setChats((prev) => [...prev, newChat]);
    setActiveChatId(newId);
  };

  const handleRename = (chatId, newTitle) => {
    setChats(prev => prev.map(chat => 
      chat.id === chatId ? { ...chat, title: newTitle } : chat
    ));
  };

  const deleteChat = (chatId) => {
    setChats(prev => prev.filter(chat => chat.id !== chatId));
    if (activeChatId === chatId) {
      setActiveChatId(chats[0]?.id || null);
    }
  };

  const clearAllChats = () => {
    setChats([]);
    setActiveChatId(null);
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !activeChatId) return;
    
    setLoading(true);
    const userMsg = { role: 'user', content: newMessage };
    const updatedMessages = [...activeMessages, userMsg];
    
    try {
      setActiveMessages(updatedMessages);
      const res = await axios.post(
        'http://127.0.0.1:7860/llama_predict',
        { user_message: newMessage },
        { headers: { 'Content-Type': 'application/json' } }
      );
      
      const botMsg = { role: 'bot', content: res.data.bot_reply };
      const finalMessages = [...updatedMessages, botMsg];
      
      setActiveMessages(finalMessages);
      setChats(prev => prev.map(chat => 
        chat.id === activeChatId ? { ...chat, messages: finalMessages } : chat
      ));
      setNewMessage('');
      setError(null);
    } catch (err) {
      console.error('Error:', err);
      setError(`Error: ${err.response?.data?.detail || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Renderers
  const renderMessageContent = (content) => (
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
            <code className={className} {...props}>{children}</code>
          );
        }
      }}
    />
  );

  return (
    <div className="chat-app">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-header">
          <h2>EduBot</h2>
          <div className="sidebar-actions">
            <IconButton onClick={toggleSidebar}>
              <img 
                src={SidebarIcon} 
                alt="Toggle sidebar" 
                style={{ 
                  width: 24, 
                  height: 24,
                  filter: 'brightness(0) invert(1)',
                  transform: sidebarOpen ? 'rotate(0deg)' : 'rotate(180deg)',
                  transition: 'transform 0.3s ease'
                }} 
              />
            </IconButton>
            <IconButton 
              onClick={createNewChat}
              sx={{
                position: 'relative',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
              }}
            >
              <ChatBubbleOutline sx={{ color: '#fff', fontSize: 24 }} />
              <Add sx={{
                position: 'absolute',
                top: 4,
                right: 4,
                fontSize: 14,
                backgroundColor: '#fff',
                borderRadius: '50%',
                padding: '2px',
                color: '#2f2f3f'
              }} />
            </IconButton>
          </div>
        </div>

        <div className="chat-list">
          {chats.map((chat) => (
            <div
              key={chat.id}
              className={`chat-item ${chat.id === activeChatId ? 'active-chat' : ''}`}
              onClick={() => setActiveChatId(chat.id)}
            >
              {editingChatId === chat.id ? (
                <TextField
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  onBlur={() => {
                    handleRename(chat.id, editedTitle);
                    setEditingChatId(null);
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && setEditingChatId(null)}
                  autoFocus
                  fullWidth
                  variant="standard"
                  InputProps={{
                    style: { color: '#fff', fontSize: '0.95rem' },
                    disableUnderline: true,
                  }}
                />
              ) : (
                <span 
                  className="chat-item-title"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditedTitle(chat.title);
                    setEditingChatId(chat.id);
                  }}
                >
                  {chat.title}
                </span>
              )}

              <div className="chat-item-actions">
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    setAnchorEl(e.currentTarget);
                  }}
                >
                  <MoreHoriz sx={{ color: '#fff' }} />
                </IconButton>

                <Menu
                  anchorEl={anchorEl}
                  open={openMenu}
                  onClose={() => setAnchorEl(null)}
                  PaperProps={{
                    sx: {
                      bgcolor: '#3d3d4e',
                      color: '#fff',
                      minWidth: '120px',
                      '& .MuiMenuItem-root': {
                        fontSize: '0.9rem',
                        '&:hover': { bgcolor: '#4b4b5b' }
                      }
                    }
                  }}
                >
                  <MenuItem onClick={() => {
                    setEditingChatId(chat.id);
                    setEditedTitle(chat.title);
                    setAnchorEl(null);
                  }}>
                    Rename
                  </MenuItem>
                  <MenuItem 
                    onClick={() => deleteChat(chat.id)}
                    sx={{ color: '#ff4444', '&:hover': { color: '#ff6666' } }}
                  >
                    Delete
                  </MenuItem>
                </Menu>
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

      {/* Main Chat Area */}
      <div className="chat-panel">
        <div className="chat-panel-header">
        {!sidebarOpen && (
        <div className="left-controls">
          <IconButton 
            onClick={toggleSidebar}
            sx={{
              mb: 2,
              '&:hover': { transform: 'scale(1.1)' }
            }}
          >
            <img 
              src={SidebarIcon} 
              alt="Open sidebar" 
              style={{ 
                width: 24, 
                height: 24,
                filter: 'brightness(0) invert(1)'
              }} 
            />          
          </IconButton>
          <IconButton 
            onClick={createNewChat}
            sx={{
              backgroundColor: 'var(--primary-blue)',
              '&:hover': { backgroundColor: 'var(--hover-blue)' }
            }}
          >
            <Add sx={{ color: '#fff' }} />
          </IconButton>
        </div>
      )}
          <h2>EduBot Chat</h2>
        </div>

        <Paper className="chat-container" elevation={3}>
          {error && (
            <Typography variant="body2" className="error-message">
              {error}
            </Typography>
          )}

          <Box className="messages-container">
            {activeMessages.length === 0 ? (
              <Typography variant="body2" sx={{ textAlign: 'center', color: 'gray' }}>
                No messages yet. Start the conversation!
              </Typography>
            ) : (
              activeMessages.map((msg, idx) => (
                <Box
                  key={idx}
                  className={`message-bubble ${msg.role === 'user' ? 'user-message' : 'bot-message'}`}
                >
                  {renderMessageContent(msg.content)}
                </Box>
              ))
            )}
            {loading && <div className="loading-indicator">Thinking...</div>}
            <div ref={messagesEndRef} />
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
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            />
            <IconButton 
              onClick={handleSend} 
              disabled={loading || !activeChatId}
              sx={{ ml: 1 }}
            >
              <Send />
            </IconButton>
          </Box>
        </Paper>
      </div>
    </div>
  );
};

export default ChatApp;