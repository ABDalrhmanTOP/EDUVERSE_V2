// src/pages/ChatLayout.js
import React, { useState } from 'react';
import './ChatLayout.css';

// Material-UI icons (ensure you have them installed, or replace with your preferred icons)
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

const ChatLayout = () => {
  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Chat list (for demo purposes, hard-coded)
  const [chats, setChats] = useState([
    { id: 1, title: 'Chat 1' },
    { id: 2, title: 'Chat 2' },
    { id: 3, title: 'Chat 3' }
  ]);
  const [activeChatId, setActiveChatId] = useState(null);

  // Handlers for sidebar actions
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  
  const createNewChat = () => {
    const newId = Date.now();
    const newChat = { id: newId, title: `New Chat ${newId}` };
    setChats([...chats, newChat]);
    setActiveChatId(newId);
  };

  const editChatTitle = (id) => {
    const newTitle = prompt('Enter new chat title:');
    if (newTitle) {
      setChats(chats.map(chat => chat.id === id ? { ...chat, title: newTitle } : chat));
    }
  };

  const deleteChat = (id) => {
    setChats(chats.filter(chat => chat.id !== id));
    if (activeChatId === id) {
      setActiveChatId(null);
    }
  };

  const clearAllChats = () => {
    setChats([]);
    setActiveChatId(null);
  };

  // For now the chat panel is static.
  return (
    <div className="chat-layout">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h2>Chats</h2>
          <div className="sidebar-actions">
            <button className="icon-button" onClick={createNewChat} title="New Chat">
              <AddIcon />
            </button>
            <button className="icon-button" onClick={toggleSidebar} title="Close Sidebar">
              <CloseIcon />
            </button>
          </div>
        </div>
        <div className="chat-list">
          {chats.map(chat => (
            <div
              key={chat.id}
              className={`chat-item ${chat.id === activeChatId ? 'active-chat' : ''}`}
              onClick={() => setActiveChatId(chat.id)}
            >
              <span className="chat-item-title">{chat.title}</span>
              <div className="chat-item-actions">
                <button className="icon-button" onClick={(e) => { e.stopPropagation(); editChatTitle(chat.id); }} title="Edit Chat">
                  <EditIcon />
                </button>
                <button className="icon-button" onClick={(e) => { e.stopPropagation(); deleteChat(chat.id); }} title="Delete Chat">
                  <DeleteIcon />
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="sidebar-footer">
          <button className="icon-button clear-button" onClick={clearAllChats} title="Clear All Chats">
            <DeleteIcon />
            <span>Clear All</span>
          </button>
        </div>
      </div>

      {/* Chat Panel */}
      <div className="chat-panel">
        <div className="chat-panel-header">
          {!sidebarOpen && (
            <button className="icon-button" onClick={toggleSidebar} title="Open Sidebar">
              <MenuIcon />
            </button>
          )}
          <h2>EduBot Chat</h2>
        </div>
        <div className="chat-panel-body">
          {/* Placeholder for chat messages */}
          <p>Your chat messages will appear here...</p>
        </div>
      </div>
    </div>
  );
};

export default ChatLayout;
