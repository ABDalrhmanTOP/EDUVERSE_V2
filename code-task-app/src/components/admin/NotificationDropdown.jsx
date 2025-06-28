import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  FaBell, 
  FaTimes, 
  FaCheck, 
  FaTrash, 
  FaCog,
  FaInfoCircle,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle,
  FaUser,
  FaBook,
  FaTasks,
  FaTrashAlt,
  FaCog as FaSettings,
  FaExternalLinkAlt
} from 'react-icons/fa';
import apiClient from '../../api/axios';
import '../../styles/admin/NotificationDropdown.css';

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [deleteAllLoading, setDeleteAllLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const dropdownRef = useRef(null);
  const bellRef = useRef(null);
  const audioContextRef = useRef(null);
  const navigate = useNavigate();

  // Initialize audio context for notification sounds
  useEffect(() => {
    if (typeof window !== 'undefined' && window.AudioContext) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
  }, []);

  // Play notification sound
  const playNotificationSound = () => {
    if (audioContextRef.current && audioContextRef.current.state === 'running') {
      try {
        const oscillator = audioContextRef.current.createOscillator();
        const gainNode = audioContextRef.current.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContextRef.current.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContextRef.current.currentTime);
        oscillator.frequency.setValueAtTime(600, audioContextRef.current.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(800, audioContextRef.current.currentTime + 0.2);
        
        gainNode.gain.setValueAtTime(0.1, audioContextRef.current.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + 0.3);
        
        oscillator.start(audioContextRef.current.currentTime);
        oscillator.stop(audioContextRef.current.currentTime + 0.3);
      } catch (error) {
        console.log('Audio playback not supported or blocked by browser');
      }
    }
  };

  // Polling interval for notifications
  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();

    // Set up polling every 30 seconds
    const interval = setInterval(() => {
      fetchNotifications();
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Bell vibration effect when unread count changes
  useEffect(() => {
    if (unreadCount > 0 && bellRef.current) {
      // Play notification sound
      playNotificationSound();
      
      // Initial vibration when new notification arrives
      bellRef.current.style.animation = 'bellVibrate 0.5s ease-in-out';
      setTimeout(() => {
        if (bellRef.current && unreadCount > 0 && !isOpen) {
          // Start continuous ringing after initial vibration
          bellRef.current.style.animation = 'bellRing 2s ease-in-out infinite';
        }
      }, 500);
    }
  }, [unreadCount]);

  // Continuous bell ringing when there are unread notifications and dropdown is closed
  useEffect(() => {
    if (unreadCount > 0 && !isOpen && bellRef.current) {
      // Start continuous ringing
      bellRef.current.style.animation = 'bellRing 2s ease-in-out infinite';
    } else if (bellRef.current) {
      // Stop ringing when dropdown is opened or no unread notifications
      bellRef.current.style.animation = '';
    }
  }, [unreadCount, isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setShowSettings(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await apiClient.get('/notifications?limit=15');
      setNotifications(response.data.notifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await apiClient.get('/notifications/unread-count');
      setUnreadCount(response.data.unread_count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await apiClient.patch(`/notifications/${notificationId}/read`);
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, is_read: true, read_at: new Date().toISOString() }
            : notification
        )
      );
      fetchUnreadCount();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const showSuccessMessage = (message, isError = false) => {
    setSuccessMessage({ message, isError });
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const markAllAsRead = async () => {
    try {
      setLoading(true);
      await apiClient.patch('/notifications/mark-all-read');
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, is_read: true, read_at: new Date().toISOString() }))
      );
      setUnreadCount(0);
      
      // Show success feedback
      showSuccessMessage('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      showSuccessMessage('Failed to mark notifications as read', true);
    } finally {
      setLoading(false);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await apiClient.delete(`/notifications/${notificationId}`);
      setNotifications(prev => prev.filter(notification => notification.id !== notificationId));
      fetchUnreadCount();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const deleteAllNotifications = async () => {
    // Show confirmation modal instead of browser alert
    setShowDeleteAllModal(true);
  };

  const confirmDeleteAll = async () => {
    try {
      setDeleteAllLoading(true);
      await apiClient.delete('/notifications');
      setNotifications([]);
      setUnreadCount(0);
      
      // Show success feedback
      showSuccessMessage('All notifications deleted successfully');
    } catch (error) {
      console.error('Error deleting all notifications:', error);
      showSuccessMessage('Failed to delete notifications', true);
    } finally {
      setDeleteAllLoading(false);
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
        return '#b8860b';
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

  const handleViewAllNotifications = () => {
    // Close the dropdown first
    setIsOpen(false);
    
    // Use React Router navigation
    navigate('/notifications');
  };

  const handleSettingsClick = () => {
    setShowSettings(!showSettings);
  };

  return (
    <div className="notification-dropdown-container" ref={dropdownRef}>
      {/* Bell Icon with Badge */}
      <motion.button
        ref={bellRef}
        className={`notification-bell ${unreadCount > 0 ? 'has-unread' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <FaBell />
        {unreadCount > 0 && (
          <motion.span
            className="notification-badge"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            key={unreadCount}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.span>
        )}
        {/* Sound wave effect when ringing */}
        {unreadCount > 0 && !isOpen && (
          <div className="sound-waves">
            <span></span>
            <span></span>
            <span></span>
          </div>
        )}
      </motion.button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="notification-dropdown"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            {/* Success Message */}
            <AnimatePresence>
              {successMessage && (
                <motion.div
                  className={`success-message ${successMessage.isError ? 'error' : ''}`}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  {successMessage.isError ? <FaTimesCircle /> : <FaCheckCircle />}
                  <span>{successMessage.message}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Header */}
            <div className="notification-header">
              <div className="header-left">
                <h3>Notifications</h3>
                {unreadCount > 0 && (
                  <span className="unread-count-badge">{unreadCount} unread</span>
                )}
              </div>
              <div className="notification-actions">
                <motion.button
                  className="notification-settings-btn"
                  onClick={handleSettingsClick}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="Notification settings"
                >
                  <FaSettings />
                </motion.button>
              </div>
            </div>

            {/* Settings Panel */}
            <AnimatePresence>
              {showSettings && (
                <motion.div
                  className="notification-settings-panel"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="settings-content">
                    <h4>Notification Settings</h4>
                    <div className="setting-item">
                      <label>
                        <input type="checkbox" defaultChecked /> Email notifications
                      </label>
                    </div>
                    <div className="setting-item">
                      <label>
                        <input type="checkbox" defaultChecked /> Sound alerts
                      </label>
                    </div>
                    <div className="setting-item">
                      <label>
                        <input type="checkbox" defaultChecked /> Desktop notifications
                      </label>
                    </div>
                    <div className="setting-item">
                      <label>
                        <input type="checkbox" defaultChecked /> Auto-refresh (30s)
                      </label>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Notifications List */}
            <div className="notifications-list">
              {/* Action Buttons */}
              {notifications.length > 0 && (
                <div className="notification-actions-bar">
                  {unreadCount > 0 && (
                    <motion.button
                      className="mark-all-read-btn"
                      onClick={markAllAsRead}
                      disabled={loading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {loading ? (
                        <FaTimes className="loading-spinner" />
                      ) : (
                        <FaCheck />
                      )}
                      <span>Mark All as Read</span>
                    </motion.button>
                  )}
                  <motion.button
                    className="delete-all-btn"
                    onClick={deleteAllNotifications}
                    disabled={deleteAllLoading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {deleteAllLoading ? (
                      <FaTimes className="loading-spinner" />
                    ) : (
                      <FaTrashAlt />
                    )}
                    <span>Delete All</span>
                  </motion.button>
                </div>
              )}

              {notifications.length === 0 ? (
                <div className="no-notifications">
                  <FaBell className="no-notifications-icon" />
                  <p>No notifications</p>
                  <span>You're all caught up!</span>
                </div>
              ) : (
                notifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    className={`notification-item ${!notification.is_read ? 'unread' : ''}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    style={{
                      borderLeftColor: !notification.is_read ? getNotificationColor(notification.type) : 'transparent'
                    }}
                  >
                    <div className="notification-content">
                      <div 
                        className="notification-icon-container"
                        style={{ backgroundColor: `${getNotificationColor(notification.type)}15` }}
                      >
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="notification-details">
                        <h4 className="notification-title">{notification.title}</h4>
                        <p className="notification-message">{notification.message}</p>
                        <div className="notification-meta">
                          <span className="notification-time">
                            {formatTime(notification.created_at)}
                          </span>
                          {!notification.is_read && (
                            <span className="unread-indicator">• New</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="notification-actions">
                      {!notification.is_read && (
                        <motion.button
                          className="mark-read-btn"
                          onClick={() => markAsRead(notification.id)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          title="Mark as read"
                        >
                          <FaCheck />
                        </motion.button>
                      )}
                      <motion.button
                        className="delete-notification-btn"
                        onClick={() => deleteNotification(notification.id)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        title="Delete notification"
                      >
                        <FaTrash />
                      </motion.button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="notification-footer">
                <button 
                  className="view-all-notifications-btn"
                  onClick={handleViewAllNotifications}
                >
                  <FaExternalLinkAlt />
                  View All Notifications
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

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
                  disabled={deleteAllLoading}
                >
                  Cancel
                </button>
                <button
                  className="confirm-btn"
                  onClick={confirmDeleteAll}
                  disabled={deleteAllLoading}
                >
                  {deleteAllLoading ? (
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

export default NotificationDropdown; 