import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaSearch, 
  FaFilter, 
  FaBell, 
  FaCheck, 
  FaTrash, 
  FaTimes,
  FaInfoCircle,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle,
  FaUser,
  FaBook,
  FaTasks,
  FaTrashAlt,
  FaSort,
  FaSortUp,
  FaSortDown
} from 'react-icons/fa';
import apiClient from '../api/axios';
import './NotificationsPage.css';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/notifications?limit=100');
      setNotifications(response.data.notifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await apiClient.patch(`/notifications/${notificationId}/read`);
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, is_read: true, read_at: new Date().toISOString() }
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await apiClient.delete(`/notifications/${notificationId}`);
      setNotifications(prev => prev.filter(notification => notification.id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      setBulkLoading(true);
      await apiClient.patch('/notifications/mark-all-read');
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, is_read: true, read_at: new Date().toISOString() }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    } finally {
      setBulkLoading(false);
    }
  };

  const deleteAllNotifications = async () => {
    setShowDeleteAllModal(true);
  };

  const confirmDeleteAll = async () => {
    try {
      setBulkLoading(true);
      await apiClient.delete('/notifications');
      setNotifications([]);
    } catch (error) {
      console.error('Error deleting all notifications:', error);
    } finally {
      setBulkLoading(false);
      setShowDeleteAllModal(false);
    }
  };

  const cancelDeleteAll = () => {
    setShowDeleteAllModal(false);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'user_registration':
        return <FaUser />;
      case 'course_completion':
        return <FaBook />;
      case 'task_assignment':
        return <FaTasks />;
      case 'system':
        return <FaInfoCircle />;
      case 'warning':
        return <FaExclamationTriangle />;
      case 'success':
        return <FaCheckCircle />;
      case 'error':
        return <FaTimesCircle />;
      default:
        return <FaBell />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'user_registration':
        return '#b8860b';
      case 'course_completion':
        return '#10b981';
      case 'task_assignment':
        return '#f59e0b';
      case 'system':
        return '#b8860b';
      case 'warning':
        return '#f59e0b';
      case 'success':
        return '#10b981';
      case 'error':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const filteredNotifications = notifications
    .filter(notification => {
      const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           notification.message.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterType === 'all' || 
                           (filterType === 'unread' && !notification.is_read) ||
                           (filterType === 'read' && notification.is_read) ||
                           notification.type === filterType;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.created_at) - new Date(a.created_at);
      if (sortBy === 'oldest') return new Date(a.created_at) - new Date(b.created_at);
      if (sortBy === 'unread') return (a.is_read ? 1 : 0) - (b.is_read ? 1 : 0);
      return 0;
    });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="notifications-page">
      {/* Header Section */}
      <div className="notifications-header">
        <div className="header-content">
          <div className="header-left">
            <motion.div 
              className="page-title"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <FaBell className="title-icon" />
              <h1>Notifications</h1>
              {unreadCount > 0 && (
                <span className="unread-badge">{unreadCount} unread</span>
              )}
            </motion.div>
            <p className="page-subtitle">Manage and view all your notifications</p>
          </div>
          
          <div className="header-actions">
            {notifications.length > 0 && (
              <>
                {unreadCount > 0 && (
                  <motion.button
                    className="action-btn mark-all-btn"
                    onClick={markAllAsRead}
                    disabled={bulkLoading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {bulkLoading ? <FaTimes className="loading-spinner" /> : <FaCheck />}
                    <span>Mark All as Read</span>
                  </motion.button>
                )}
                <motion.button
                  className="action-btn delete-all-btn"
                  onClick={deleteAllNotifications}
                  disabled={bulkLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {bulkLoading ? <FaTimes className="loading-spinner" /> : <FaTrashAlt />}
                  <span>Delete All</span>
                </motion.button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Search and Filters Section */}
      <div className="search-filters-section">
        <div className="search-container">
          <div className="search-input-wrapper">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button
                className="clear-search-btn"
                onClick={() => setSearchTerm('')}
              >
                <FaTimes />
              </button>
            )}
          </div>
        </div>

        <div className="filters-container">
          <motion.button
            className="filter-toggle-btn"
            onClick={() => setShowFilters(!showFilters)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FaFilter />
            <span>Filters</span>
            <motion.div
              animate={{ rotate: showFilters ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <FaSort />
            </motion.div>
          </motion.button>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                className="filters-panel"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="filter-group">
                  <label>Filter by:</label>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">All Notifications</option>
                    <option value="unread">Unread Only</option>
                    <option value="read">Read Only</option>
                    <option value="user_registration">User Registration</option>
                    <option value="course_completion">Course Completion</option>
                    <option value="task_assignment">Task Assignment</option>
                    <option value="system">System</option>
                    <option value="warning">Warnings</option>
                    <option value="success">Success</option>
                    <option value="error">Errors</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label>Sort by:</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="filter-select"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="unread">Unread First</option>
                  </select>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Notifications Content */}
      <div className="notifications-content">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="empty-state">
            <FaBell className="empty-icon" />
            <h3>No notifications found</h3>
            <p>
              {searchTerm || filterType !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'You\'re all caught up! No notifications yet.'
              }
            </p>
          </div>
        ) : (
          <div className="notifications-grid">
            {filteredNotifications.map((notification, index) => (
              <motion.div
                key={notification.id}
                className={`notification-card ${!notification.is_read ? 'unread' : ''}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ y: -2, boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)' }}
              >
                <div className="notification-header">
                  <div 
                    className="notification-icon"
                    style={{ backgroundColor: `${getNotificationColor(notification.type)}15` }}
                  >
                    <span style={{ color: getNotificationColor(notification.type) }}>
                      {getNotificationIcon(notification.type)}
                    </span>
                  </div>
                  <div className="notification-meta">
                    <h4 className="notification-title">{notification.title}</h4>
                    <span className="notification-time">{formatTime(notification.created_at)}</span>
                  </div>
                  {!notification.is_read && (
                    <div className="unread-indicator" />
                  )}
                </div>
                
                <div className="notification-body">
                  <p className="notification-message">{notification.message}</p>
                </div>

                <div className="notification-footer">
                  <div className="notification-type">
                    <span className="type-badge" style={{ backgroundColor: getNotificationColor(notification.type) }}>
                      {notification.type.replace('_', ' ')}
                    </span>
                  </div>
                  
                  <div className="notification-actions">
                    {!notification.is_read && (
                      <motion.button
                        className="action-btn mark-read-btn"
                        onClick={() => markAsRead(notification.id)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        title="Mark as read"
                      >
                        <FaCheck />
                      </motion.button>
                    )}
                    <motion.button
                      className="action-btn delete-btn"
                      onClick={() => deleteNotification(notification.id)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      title="Delete notification"
                    >
                      <FaTrash />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Delete All Confirmation Modal */}
      <AnimatePresence>
        {showDeleteAllModal && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={cancelDeleteAll}
          >
            <motion.div
              className="confirmation-modal"
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <div className="modal-icon">
                  <FaTrashAlt />
                </div>
                <h3>Delete All Notifications</h3>
              </div>
              
              <div className="modal-content">
                <p>Are you sure you want to delete all notifications?</p>
                <p className="warning-text">This action cannot be undone.</p>
              </div>
              
              <div className="modal-actions">
                <button
                  className="cancel-btn"
                  onClick={cancelDeleteAll}
                  disabled={bulkLoading}
                >
                  Cancel
                </button>
                <button
                  className="confirm-btn"
                  onClick={confirmDeleteAll}
                  disabled={bulkLoading}
                >
                  {bulkLoading ? (
                    <>
                      <FaTimes className="loading-spinner" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <FaTrashAlt />
                      Delete All
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationsPage; 