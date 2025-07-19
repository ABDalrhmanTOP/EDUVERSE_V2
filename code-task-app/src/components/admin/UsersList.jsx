import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaUsers, FaEdit, FaTrash, FaEye, FaSync, FaUserPlus, FaEnvelope, FaCalendar, FaCheckCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import apiClient from '../../api/axios';
import UserForm from './UserForm';
import ConfirmationModal from './ConfirmationModal';
import SuccessNotification from './SuccessNotification';
import '../../styles/admin/UsersList.css';

const UsersList = () => {
  const { t, i18n } = useTranslation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, userId: null, userName: '' });
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await apiClient.get('/admin/users');
      setUsers(response.data || []);
    } catch (error) {
      setError(t('admin.users.failedToLoadUsers'));
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchUsers();
    setRefreshing(false);
  };

  const handleAddUser = () => {
    setEditingUser(null);
    setShowForm(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setShowForm(true);
  };

  const handleDeleteUser = (userId, userName) => {
    setDeleteModal({
      isOpen: true,
      userId: userId,
      userName: userName
    });
  };

  const confirmDeleteUser = async () => {
    try {
      await apiClient.delete(`/admin/users/${deleteModal.userId}`);
      setUsers(users.filter(user => user.id !== deleteModal.userId));
      setDeleteModal({ isOpen: false, userId: null, userName: '' });
      setSuccessMessage(t('admin.users.userDeletedSuccessfully'));
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setError(t('admin.users.failedToDeleteUser'));
      setDeleteModal({ isOpen: false, userId: null, userName: '' });
    }
  };

  const handleViewUserDetails = (userId) => {
    navigate(`/AdminDashboard/userdetail/${userId}`);
  };

  const handleUserSuccess = () => {
    setShowForm(false);
    setEditingUser(null);
    fetchUsers();
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingUser(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return t('admin.users.notSpecified');
    return new Date(dateString).toLocaleDateString(i18n.language === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      calendar: 'gregory'
    });
  };

  if (loading) {
    return (
      <div className="users-list-loading">
        <div className="users-list-spinner"></div>
        <p>{t('admin.users.loadingUsers')}</p>
      </div>
    );
  }

  return (
    <div className="users-list-container" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="users-list-header">
        <div className="users-list-title-section">
          <h1 className="users-list-title">
            <FaUsers className="users-list-icon" />
            {t('admin.users.title')}
          </h1>
          <p className="users-list-subtitle">{t('admin.users.subtitle')}</p>
        </div>
        <div className="users-list-actions">
          <motion.button
            className="courses-list-refresh-btn"
            onClick={handleRefresh}
            disabled={refreshing}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaSync className={refreshing ? 'spinning' : ''} />
            {refreshing ? t('admin.users.refreshing') : t('admin.users.refresh')}
          </motion.button>
          <motion.button
            className="users-list-add-btn"
            onClick={handleAddUser}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaUserPlus />
            {t('admin.users.addUser')}
          </motion.button>
        </div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="users-list-error"
        >
          {error}
        </motion.div>
      )}

      <div className="users-list-content">
        {users.length === 0 ? (
          <div className="users-list-empty">
            <FaUsers className="users-list-empty-icon" />
            <h3>{t('admin.users.noUsersAvailable')}</h3>
            <p>{t('admin.users.noUsersAvailableDesc')}</p>
            <motion.button
              className="users-list-add-btn"
              onClick={handleAddUser}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaUserPlus />
              {t('admin.users.addYourFirstUser')}
            </motion.button>
          </div>
        ) : (
          <div className="users-list-table-container">
            <table className="users-list-table">
              <thead>
                <tr>
                  <th>{t('admin.users.user')}</th>
                  <th>{t('admin.users.email')}</th>
                  <th>{t('admin.users.role')}</th>
                  <th>{t('admin.users.status')}</th>
                  <th>{t('admin.users.joined')}</th>
                  <th>{t('admin.users.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="users-list-row"
                  >
                    <td className="users-list-cell users-list-info">
                      <div className="users-list-info-content">
                        <div className="users-list-avatar">
                          {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div className="users-list-details">
                          <strong>{user.name || t('admin.users.unnamedUser')}</strong>
                          <span className="users-list-id">ID: {user.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="users-list-cell users-list-email">
                      <div className="users-list-email-content">
                        <FaEnvelope className="users-list-email-icon" />
                        <span>{user.email}</span>
                      </div>
                    </td>
                    <td className="users-list-cell users-list-role">
                      <span className={`users-list-role-badge ${user.role || 'user'}`}>
                        {user.role || 'user'}
                      </span>
                    </td>
                    <td className="users-list-cell users-list-status">
                      <span className={`users-list-status-badge ${user.email_verified_at ? 'verified' : 'pending'}`} style={{
                        background: user.email_verified_at ? '#e8f5e9' : '#fff8e1',
                        color: user.email_verified_at ? '#43a047' : '#e53935',
                        fontWeight: 800,
                        borderRadius: 12,
                        padding: '6px 18px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        fontSize: 15,
                        boxShadow: user.email_verified_at ? '0 2px 8px #43a04722' : '0 2px 8px #e5393522',
                        letterSpacing: 1
                      }}>
                        {user.email_verified_at ? <FaCheckCircle style={{ color: '#43a047', fontSize: 18, marginRight: 4 }} /> : <FaEnvelope style={{ color: '#e53935', fontSize: 18, marginRight: 4 }} />}
                        {user.email_verified_at ? 'VERIFIED' : 'PENDING'}
                      </span>
                    </td>
                    <td className="users-list-cell users-list-date">
                      <div className="users-list-date-content">
                        <FaCalendar className="users-list-date-icon" />
                        <span>{formatDate(user.created_at)}</span>
                      </div>
                    </td>
                    <td className="users-list-cell users-list-actions-cell">
                      <div className="users-list-action-buttons">
                        <motion.button
                          className="users-list-action-btn users-list-view-btn"
                          onClick={() => handleViewUserDetails(user.id)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          title={t('admin.users.viewDetails')}
                        >
                          <FaEye />
                        </motion.button>
                        <motion.button
                          className="users-list-action-btn users-list-edit-btn"
                          onClick={() => handleEditUser(user)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          title={t('admin.users.editUser')}
                        >
                          <FaEdit />
                        </motion.button>
                        {user.role !== 'admin' && (
                          <motion.button
                            className="users-list-action-btn users-list-delete-btn"
                            onClick={() => handleDeleteUser(user.id, user.name || user.email)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            title={t('admin.users.deleteUser')}
                          >
                            <FaTrash />
                          </motion.button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <UserForm
          editingUser={editingUser}
          onSuccess={handleUserSuccess}
          onClose={handleCloseForm}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, userId: null, userName: '' })}
        onConfirm={confirmDeleteUser}
        title={t('admin.users.deleteUserTitle')}
        message={t('admin.users.deleteUserConfirm', { userName: deleteModal.userName })}
        confirmText={t('admin.users.deleteUser')}
        cancelText={t('common.cancel')}
        type="danger"
      />

      {successMessage && (
        <SuccessNotification
          message={successMessage}
          onClose={() => setSuccessMessage('')}
        />
      )}
    </div>
  );
};

export default UsersList;
