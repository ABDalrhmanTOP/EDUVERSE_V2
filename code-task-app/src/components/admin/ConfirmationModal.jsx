import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaExclamationTriangle, FaTimes, FaTrash, FaCheck } from 'react-icons/fa';
import '../../styles/admin/ConfirmationModal.css';

const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm Action", 
  message = "Are you sure you want to proceed?", 
  confirmText = "Confirm", 
  cancelText = "Cancel",
  type = "danger", // danger, warning, info
  icon = null
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    if (icon) return icon;
    switch (type) {
      case 'danger':
        return <FaTrash />;
      case 'warning':
        return <FaExclamationTriangle />;
      case 'info':
        return <FaCheck />;
      default:
        return <FaExclamationTriangle />;
    }
  };

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          iconColor: '#dc3545',
          buttonBg: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
          buttonHover: 'linear-gradient(135deg, #c82333 0%, #a71e2a 100%)'
        };
      case 'warning':
        return {
          iconColor: '#ffc107',
          buttonBg: 'linear-gradient(135deg, #ffc107 0%, #e0a800 100%)',
          buttonHover: 'linear-gradient(135deg, #e0a800 0%, #d39e00 100%)'
        };
      case 'info':
        return {
          iconColor: '#17a2b8',
          buttonBg: 'linear-gradient(135deg, #17a2b8 0%, #138496 100%)',
          buttonHover: 'linear-gradient(135deg, #138496 0%, #117a8b 100%)'
        };
      default:
        return {
          iconColor: '#6c757d',
          buttonBg: 'linear-gradient(135deg, #6c757d 0%, #5a6268 100%)',
          buttonHover: 'linear-gradient(135deg, #5a6268 0%, #545b62 100%)'
        };
    }
  };

  const typeStyles = getTypeStyles();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="confirmation-modal-overlay"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 50 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="confirmation-modal-container"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="confirmation-modal-header">
            <div className="confirmation-modal-icon" style={{ color: typeStyles.iconColor }}>
              {getIcon()}
            </div>
            <button
              className="confirmation-modal-close-btn"
              onClick={onClose}
              type="button"
            >
              <FaTimes />
            </button>
          </div>

          <div className="confirmation-modal-content">
            <h3 className="confirmation-modal-title">{title}</h3>
            <p className="confirmation-modal-message">{message}</p>
          </div>

          <div className="confirmation-modal-actions">
            <motion.button
              type="button"
              className="confirmation-modal-cancel-btn"
              onClick={onClose}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {cancelText}
            </motion.button>
            <motion.button
              type="button"
              className="confirmation-modal-confirm-btn"
              onClick={() => {
                onConfirm();
                onClose();
              }}
              style={{ background: typeStyles.buttonBg }}
              whileHover={{ 
                scale: 1.02,
                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.3)'
              }}
              whileTap={{ scale: 0.98 }}
            >
              {confirmText}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ConfirmationModal; 