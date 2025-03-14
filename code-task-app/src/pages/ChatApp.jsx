// src/pages/ChatApp.js
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import '../styles/ChatApp.css';
import SidebarIcon from '../assets/sidebar-left-svgrepo-com.svg';
import NewChatIcon from '../assets/chat-add.svg';
import EduVerseIcon from '../assets/sidebar-icon.png';

import { CopyAll, Edit, Check, Send, MoreHoriz } from '@mui/icons-material';
import {
  Box,
  TextField,
  IconButton,
  Paper,
  Typography,
  Button,
  Menu,
  MenuItem,
  Tooltip
} from '@mui/material';

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

  // For renaming chats
  const [editingChatId, setEditingChatId] = useState(null);
  const [editedTitle, setEditedTitle] = useState('');

  // For editing user messages
  const [editingMessageIndex, setEditingMessageIndex] = useState(null);
  const [editedMessage, setEditedMessage] = useState('');

  const [anchorEl, setAnchorEl] = useState(null);
  const messagesEndRef = useRef(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const openMenu = Boolean(anchorEl);

  // Effects to update active messages and auto-scroll
  useEffect(() => {
    const chat = chats.find((c) => c.id === activeChatId);
    setActiveMessages(chat ? chat.messages : []);
  }, [activeChatId, chats]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const createNewChat = () => {
    const newId = Date.now();
    const newChat = { id: newId, title: `New Chat ${newId}`, messages: [] };
    setChats((prev) => [...prev, newChat]);
    setActiveChatId(newId);
  };

  const handleRename = (chatId, newTitle) => {
    setChats(prev =>
      prev.map(chat => (chat.id === chatId ? { ...chat, title: newTitle } : chat))
    );
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
      setNewMessage('');
      setActiveMessages(updatedMessages);
      const res = await axios.post(
        'http://127.0.0.1:7860/llama_predict',
        { user_message: newMessage },
        { headers: { 'Content-Type': 'application/json' } }
      );

      const botMsg = { role: 'bot', content: res.data.bot_reply };
      const finalMessages = [...updatedMessages, botMsg];

      setActiveMessages(finalMessages);
      setChats(prev =>
        prev.map(chat =>
          chat.id === activeChatId ? { ...chat, messages: finalMessages } : chat
        )
      );
      setError(null);
    } catch (err) {
      console.error('Error:', err);
      setError(`Error: ${err.response?.data?.detail || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handlers for editing and copying messages
  const handleEditMessage = (index) => {
    setEditingMessageIndex(index);
    setEditedMessage(activeMessages[index].content);
  };

  const handleSaveEditedMessage = (index) => {
    const updatedMessages = [...activeMessages];
    updatedMessages[index].content = editedMessage;
    setActiveMessages(updatedMessages);
    setChats(prev =>
      prev.map(chat =>
        chat.id === activeChatId ? { ...chat, messages: updatedMessages } : chat
      )
    );
    setEditingMessageIndex(null);
  };

  const handleCopyMessage = (content) => {
    navigator.clipboard.writeText(content);
  };

  // Render markdown with improved code appearance
  const renderMessageContent = (content) => (
    <ReactMarkdown
      children={content}
      components={{
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '');
          return !inline && match ? (
            <SyntaxHighlighter
              language={match[1]}
              PreTag="div"
              customStyle={{
                background: "#f4f4f4",
                borderRadius: "8px",
                padding: "12px",
                fontSize: "0.9rem"
              }}
              {...props}
            >
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          ) : (
            <code
              className={className}
              {...props}
              style={{
                background: "#f4f4f4",
                borderRadius: "4px",
                padding: "2px 4px"
              }}
            >
              {children}
            </code>
          );
        }
      }}
    />
  );

  // Render user messages with edit and copy controls
  const renderUserMessage = (msg, index) => (
    <Box className="message-box">
      {editingMessageIndex === index ? (
        <TextField
          value={editedMessage}
          onChange={(e) => setEditedMessage(e.target.value)}
          variant="outlined"
          fullWidth
        />
      ) : (
        renderMessageContent(msg.content)
      )}
      <div className="message-actions">
        {editingMessageIndex === index ? (
          <IconButton onClick={() => handleSaveEditedMessage(index)}>
            <Check />
          </IconButton>
        ) : (
          <>
            <Tooltip title="Edit">
              <IconButton onClick={() => handleEditMessage(index)}>
                <Edit />
              </IconButton>
            </Tooltip>
            <Tooltip title="Copy">
              <IconButton onClick={() => handleCopyMessage(msg.content)}>
                <CopyAll />
              </IconButton>
            </Tooltip>
          </>
        )}
      </div>
    </Box>
  );

  // Render bot messages with EduVerse icon on the left and a copy button
  const renderBotMessage = (msg, index) => (
    <Box className="bot-message-wrapper">
      <img src={EduVerseIcon} alt="EduVerse" className="eduverse-icon" />
      <Box className="bot-message-text">
        {renderMessageContent(msg.content)}
      </Box>
      <Tooltip title="Copy">
        <IconButton onClick={() => handleCopyMessage(msg.content)} className="copy-button">
          <CopyAll />
        </IconButton>
      </Tooltip>
    </Box>
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
              sx={{ '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' } }}
            >
              <img 
                src={NewChatIcon} 
                alt="New Chat" 
                style={{ width: 28, height: 28 }} 
              />
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
                  <MenuItem
                    onClick={() => {
                      setEditingChatId(chat.id);
                      setEditedTitle(chat.title);
                      setAnchorEl(null);
                    }}
                  >
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
                sx={{ mb: 2, '&:hover': { transform: 'scale(1.1)' } }}
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
                  backgroundColor: 'transparent',
                  '&:hover': { backgroundColor: 'transparent' }
                }}
              >
                <img 
                  src={NewChatIcon} 
                  alt="New Chat" 
                  style={{ width: 28, height: 28 }} 
                />
              </IconButton>
            </div>
          )}
          <h2>LLAMA-3.2-Vision-11B</h2>
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
                  {msg.role === 'user'
                    ? renderUserMessage(msg, idx)
                    : renderBotMessage(msg, idx)}
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
              sx={{ 
                ml: 1, 
                borderRadius: '50%', 
                backgroundColor: '#8D99AE',
                '&:hover': { backgroundColor: '#8D99AE' }
              }}
            >
              <Send sx={{ color: '#fff' }} />
            </IconButton>
          </Box>
        </Paper>
      </div>
    </div>
  );
};

export default ChatApp;
