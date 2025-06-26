import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaUsers, FaEdit, FaTrash, FaEye, FaSync, FaUserPlus, FaEnvelope, FaCalendar } from 'react-icons/fa';
import axios from '../../api/axios';
import UserForm from './UserForm';
import '../../styles/admin/UsersList.css';

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get('/users');
      setUsers(response.data || []);
    } catch (error) {
      setError('Failed to load users. Please try again.');
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

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`/users/${userId}`);
        setUsers(users.filter(user => user.id !== userId));
      } catch (error) {
        alert('Failed to delete user. Please try again.');
      }
    }
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
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="users-list-loading">
        <div className="users-list-spinner"></div>
        <p>Loading users...</p>
      </div>
    );
  }

  return (
    <div className="users-list-container">
      <div className="users-list-header">
        <div className="users-list-title-section">
          <h1 className="users-list-title">
            <FaUsers className="users-list-icon" />
            User Management
          </h1>
          <p className="users-list-subtitle">Manage all user accounts and permissions in one place.</p>
        </div>
        <div className="users-list-actions">
          <motion.button
            className="users-list-refresh-btn"
            onClick={handleRefresh}
            disabled={refreshing}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaSync className={refreshing ? 'spinning' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </motion.button>
          <motion.button
            className="users-list-add-btn"
            onClick={handleAddUser}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaUserPlus />
            Add User
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
            <h3>No users available</h3>
            <p>Start by adding your first user to the platform.</p>
            <motion.button
              className="users-list-add-btn"
              onClick={handleAddUser}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaUserPlus />
              Add Your First User
            </motion.button>
          </div>
        ) : (
          <div className="users-list-table-container">
            <table className="users-list-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
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
                          <strong>{user.name || 'Unnamed User'}</strong>
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
                      <span className={`users-list-status-badge ${user.email_verified_at ? 'verified' : 'pending'}`}>
                        {user.email_verified_at ? 'Verified' : 'Pending'}
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
                          onClick={() => window.open(`/AdminDashboard/user/${user.id}`, '_blank')}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          title="View Details"
                        >
                          <FaEye />
                        </motion.button>
                        <motion.button
                          className="users-list-action-btn users-list-edit-btn"
                          onClick={() => handleEditUser(user)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          title="Edit User"
                        >
                          <FaEdit />
                        </motion.button>
                        <motion.button
                          className="users-list-action-btn users-list-delete-btn"
                          onClick={() => handleDeleteUser(user.id)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          title="Delete User"
                        >
                          <FaTrash />
                        </motion.button>
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
    </div>
  );
};

export default UsersList;
