// src/components/UserForm.js
import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const emptyUser = {
  name: '',
  email: '',
  username: '',
  password: '',
  confirmPassword: '',
};

const UserForm = ({ editingUser, onSuccess, onClose }) => {
  const [user, setUser] = useState(emptyUser);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingUser) {
      setUser({
        name: editingUser.name,
        email: editingUser.email,
        username: editingUser.username,
        password: '',
        confirmPassword: '',
      });
    } else {
      setUser(emptyUser);
    }
    setErrors({});
  }, [editingUser]);

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!user.name) newErrors.name = 'Name is required.';
    if (!user.email) newErrors.email = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(user.email)) newErrors.email = 'Email is invalid.';
    if (!user.username) newErrors.username = 'Username is required.';

    if (!editingUser || user.password) {
      if (!user.password) newErrors.password = 'Password is required.';
      else if (user.password.length < 6) newErrors.password = 'Password must be at least 6 characters.';
      if (user.password !== user.confirmPassword) newErrors.confirmPassword = 'Passwords do not match.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    const userDataToSend = {
      name: user.name,
      username: user.username,
      email: user.email,
    };

    if (user.password) {
      userDataToSend.password = user.password;
    }

    try {
      if (editingUser) {
        await api.put(`/users/${editingUser.id}`, userDataToSend);
        onSuccess('User updated successfully!');
      } else {
        await api.post('/users', userDataToSend);
        onSuccess('User added successfully!');
      }
      onClose();
    } catch (error) {
      onSuccess(`Error saving user: ${error.response?.data?.message || error.message}`, true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-3">
      <div
        className="card shadow-lg border-0 rounded-4 p-4"
        style={{ backgroundColor: '#AD998A' }} // Card background: remains #AD998A
      >
        <h3 className="text-center mb-4 fw-bold" style={{ color: '#FFFFFF' }}> {/* Changed title color to white */}
          {editingUser ? 'Edit User' : 'Add New User'}
        </h3>
        <form onSubmit={handleSubmit} className="row g-3">

          {/* Name Field */}
          <div className="col-12 d-flex align-items-center mb-3">
            <label htmlFor="name" className="form-label fw-bold me-3" style={{ color: '#FFFFFF', minWidth: '100px' }}> {/* Changed label color to white */}
              Name <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className={`form-control form-control-lg border-2 flex-grow-1 ${errors.name ? 'is-invalid' : ''}`}
              id="name"
              name="name"
              value={user.name}
              onChange={handleChange}
              placeholder="e.g., John Doe"
              style={{
                backgroundColor: '#F5F3F0', // Input background: a soft, light tone
                borderColor: errors.name ? '#dc3545' : '#D1C4B8', // Border color matching theme
                color: '#4B3F38', // Input text color: dark for readability
              }}
            />
            {errors.name && <div className="invalid-feedback">{errors.name}</div>}
          </div>

          {/* Username Field */}
          <div className="col-12 d-flex align-items-center mb-3">
            <label htmlFor="username" className="form-label fw-bold me-3" style={{ color: '#FFFFFF', minWidth: '100px' }}> {/* Changed label color to white */}
              Username <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className={`form-control form-control-lg border-2 flex-grow-1 ${errors.username ? 'is-invalid' : ''}`}
              id="username"
              name="username"
              value={user.username}
              onChange={handleChange}
              placeholder="e.g., johndoe_dev"
              style={{
                backgroundColor: '#F5F3F0',
                borderColor: errors.username ? '#dc3545' : '#D1C4B8',
                color: '#4B3F38',
              }}
            />
            {errors.username && <div className="invalid-feedback">{errors.username}</div>}
          </div>

          {/* Email Field */}
          <div className="col-12 d-flex align-items-center mb-3">
            <label htmlFor="email" className="form-label fw-bold me-3" style={{ color: '#FFFFFF', minWidth: '100px' }}> {/* Changed label color to white */}
              Email <span className="text-danger">*</span>
            </label>
            <input
              type="email"
              className={`form-control form-control-lg border-2 flex-grow-1 ${errors.email ? 'is-invalid' : ''}`}
              id="email"
              name="email"
              value={user.email}
              onChange={handleChange}
              placeholder="e.g., john.doe@example.com"
              style={{
                backgroundColor: '#F5F3F0',
                borderColor: errors.email ? '#dc3545' : '#D1C4B8',
                color: '#4B3F38',
              }}
            />
            {errors.email && <div className="invalid-feedback">{errors.email}</div>}
          </div>

          {/* Password Field */}
          <div className="col-12 d-flex align-items-center mb-3">
            <label htmlFor="password" className="form-label fw-bold me-3" style={{ color: '#FFFFFF', minWidth: '100px' }}> {/* Changed label color to white */}
              Password {editingUser ? '' : <span className="text-danger">*</span>}
            </label>
            <input
              type="password"
              className={`form-control form-control-lg border-2 flex-grow-1 ${errors.password ? 'is-invalid' : ''}`}
              id="password"
              name="password"
              value={user.password}
              onChange={handleChange}
              placeholder={editingUser ? 'Leave blank to keep current' : 'Enter password'}
              required={!editingUser}
              style={{
                backgroundColor: '#F5F3F0',
                borderColor: errors.password ? '#dc3545' : '#D1C4B8',
                color: '#4B3F38',
              }}
            />
            {errors.password && <div className="invalid-feedback">{errors.password}</div>}
          </div>

          {/* Confirm Password Field */}
          <div className="col-12 d-flex align-items-center mb-3">
            <label htmlFor="confirmPassword" className="form-label fw-bold me-3" style={{ color: '#FFFFFF', minWidth: '100px' }}> {/* Changed label color to white */}
              Confirm Password {editingUser ? '' : <span className="text-danger">*</span>}
            </label>
            <input
              type="password"
              className={`form-control form-control-lg border-2 flex-grow-1 ${errors.confirmPassword ? 'is-invalid' : ''}`}
              id="confirmPassword"
              name="confirmPassword"
              value={user.confirmPassword}
              onChange={handleChange}
              placeholder={editingUser ? 'Leave blank to keep current' : 'Confirm password'}
              required={!editingUser}
              style={{
                backgroundColor: '#F5F3F0',
                borderColor: errors.confirmPassword ? '#dc3545' : '#D1C4B8',
                color: '#4B3F38',
              }}
            />
            {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
          </div>

          {/* Action Buttons */}
          <div className="col-12 d-flex justify-content-end gap-2 mt-4">
            <button
              type="button"
              className="btn btn-lg rounded-pill shadow"
              onClick={onClose}
              disabled={loading}
              style={{ backgroundColor: '#4B3F38', borderColor: '#4B3F38', color: '#FFFFFF' }} 
            >
              Close
            </button>
            <button
              type="submit"
              className="btn btn-lg rounded-pill shadow"
              disabled={loading}
              style={{ backgroundColor: '#4B3F38', borderColor: '#4B3F38', color: '#FFFFFF' }} 
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Loading...
                </>
              ) : editingUser ? (
                'Update User'
              ) : (
                'Add User'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserForm;