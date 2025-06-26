import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheck, FaTimes, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import '../../styles/admin/SuccessNotification.css';

const SuccessNotification = ({ 
  isVisible, 
  onClose, 
  message, 
  type = "success", // success, added, updated, deleted
  duration = 4000 
}) => {
  React.useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'added':
        return <FaPlus />;
      case 'updated':
        return <FaEdit />;
      case 'deleted':
        return <FaTrash />;
      case 'error':
        return <FaTimes />;
      case 'success':
      default:
        return <FaCheck />;
    }
  };

  const getTypeStyles = () => {
    switch (type) {
      case 'added':
        return {
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          iconBg: 'rgba(16, 185, 129, 0.2)',
          iconColor: '#10b981'
        };
      case 'updated':
        return {
          background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
          iconBg: 'rgba(59, 130, 246, 0.2)',
          iconColor: '#3b82f6'
        };
      case 'deleted':
        return {
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          iconBg: 'rgba(239, 68, 68, 0.2)',
          iconColor: '#ef4444'
        };
      case 'error':
        return {
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          iconBg: 'rgba(239, 68, 68, 0.2)',
          iconColor: '#ef4444'
        };
      case 'success':
      default:
        return {
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          iconBg: 'rgba(16, 185, 129, 0.2)',
          iconColor: '#10b981'
        };
    }
  };

  const typeStyles = getTypeStyles();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 300, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 300, scale: 0.8 }}
          transition={{ 
            type: "spring", 
            damping: 25, 
            stiffness: 300,
            duration: 0.3
          }}
          className="success-notification"
          style={{ background: typeStyles.background }}
        >
          <div className="success-notification-content">
            <div 
              className={`success-notification-icon${type === 'added' ? ' added' : ''}${type === 'deleted' ? ' deleted' : ''}${type === 'updated' ? ' updated' : ''}`}
              style={{ 
                backgroundColor: typeStyles.iconBg,
                color: typeStyles.iconColor
              }}
            >
              {getIcon()}
            </div>
            <div className="success-notification-text">
              <h4 className="success-notification-title">
                {type === 'added' && 'Successfully Added!'}
                {type === 'updated' && 'Successfully Updated!'}
                {type === 'deleted' && 'Successfully Deleted!'}
                {type === 'success' && 'Success!'}
                {type === 'error' && 'Error!'}
              </h4>
              <p className="success-notification-message">{message}</p>
            </div>
            <button
              className="success-notification-close"
              onClick={onClose}
              type="button"
            >
              <FaTimes />
            </button>
          </div>
          
          {/* Progress bar */}
          <motion.div
            initial={{ width: '100%' }}
            animate={{ width: '0%' }}
            transition={{ duration: duration / 1000, ease: 'linear' }}
            className="success-notification-progress"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SuccessNotification; 