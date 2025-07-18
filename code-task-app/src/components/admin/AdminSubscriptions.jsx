import React, { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { FaSearch, FaEdit, FaTrash, FaEye, FaFilter, FaDownload, FaPlus, FaUsers, FaCreditCard, FaChartLine, FaDollarSign, FaCalendarAlt } from 'react-icons/fa';
import '../../styles/admin/AdminSubscriptions.css';

const AdminSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [stats, setStats] = useState({
    total_subscriptions: 0,
    active_subscriptions: 0,
    expired_subscriptions: 0,
    cancelled_subscriptions: 0,
    pending_subscriptions: 0,
    total_revenue: 0,
    monthly_revenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [subscriptionsRes, statsRes] = await Promise.all([
        axios.get('/admin/subscriptions'),
        axios.get('/admin/subscriptions/statistics')
      ]);
      
      setSubscriptions(subscriptionsRes.data.subscriptions || []);
      setStats(statsRes.data.statistics);
    } catch (err) {
      setError('Failed to load data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e) => {
    setFilterStatus(e.target.value);
  };

  const filteredSubscriptions = subscriptions.filter(subscription => {
    const matchesSearch = subscription.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subscription.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subscription.plan_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || subscription.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const handleEditSubscription = (subscription) => {
    setSelectedSubscription(subscription);
    setShowEditModal(true);
  };

  const handleDeleteSubscription = (subscription) => {
    setSelectedSubscription(subscription);
    setShowDeleteModal(true);
  };

  const handleUpdateSubscription = async (updatedData) => {
    try {
      await axios.put(`/admin/subscriptions/${selectedSubscription.id}`, updatedData);
      setShowEditModal(false);
      setSelectedSubscription(null);
      setSuccessMessage('Payment completed successfully and subscription updated!');
      fetchData();
    } catch (err) {
      setError('Failed to update subscription');
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`/admin/subscriptions/${selectedSubscription.id}`);
      setShowDeleteModal(false);
      setSelectedSubscription(null);
      fetchData();
    } catch (err) {
      setError('Failed to delete subscription');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#10b981';
      case 'expired': return '#ef4444';
      case 'cancelled': return '#f59e0b';
      case 'pending': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Active';
      case 'expired': return 'Expired';
      case 'cancelled': return 'Cancelled';
      case 'pending': return 'Pending';
      default: return 'Unknown';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  // Statistics Components
  const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <div className="admin-stat-card" style={{ '--card-color': color }}>
      <div className="admin-stat-icon">
        <Icon />
      </div>
      <div className="admin-stat-content">
        <h3 className="admin-stat-value">{value}</h3>
        <p className="admin-stat-title">{title}</p>
        {subtitle && <p className="admin-stat-subtitle">{subtitle}</p>}
      </div>
    </div>
  );

  const ProgressBar = ({ percentage, color, label, count }) => (
    <div className="progress-item">
      <div className="progress-header">
        <span className="progress-label">{label}</span>
        <span className="progress-count">{count}</span>
      </div>
      <div className="progress-container">
        <div className="progress-bar" style={{ width: `${percentage}%`, backgroundColor: color }}>
          <span className="progress-text">{percentage}%</span>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="admin-subscriptions-container">
        <div className="admin-dashboard-loading">
          <div className="admin-loading-spinner"></div>
          <p>Loading subscription data...</p>
        </div>
      </div>
    );
  }

  const totalSubscriptions = stats.total_subscriptions;
  const activePercentage = totalSubscriptions > 0 ? Math.round((stats.active_subscriptions / totalSubscriptions) * 100) : 0;
  const expiredPercentage = totalSubscriptions > 0 ? Math.round((stats.expired_subscriptions / totalSubscriptions) * 100) : 0;
  const cancelledPercentage = totalSubscriptions > 0 ? Math.round((stats.cancelled_subscriptions / totalSubscriptions) * 100) : 0;
  const pendingPercentage = totalSubscriptions > 0 ? Math.round((stats.pending_subscriptions / totalSubscriptions) * 100) : 0;

  return (
    <div className="admin-subscriptions-container">
      {/* Success Message Bar */}
      {successMessage && (
        <div className="success-message-bar">
          {successMessage}
          <button onClick={() => setSuccessMessage('')} className="close-success-msg">×</button>
        </div>
      )}
      <div className="admin-welcome-section">
        <h1 className="admin-welcome-title">Subscription Management</h1>
        <p className="admin-welcome-subtitle">Manage and monitor all user subscriptions with comprehensive analytics</p>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Statistics Section */}
      <div className="admin-stats-grid">
        <StatCard
          title="Total Subscriptions"
          value={formatNumber(stats.total_subscriptions)}
          icon={FaUsers}
          color="#C89F9C"
        />
        <StatCard
          title="Active Subscriptions"
          value={formatNumber(stats.active_subscriptions)}
          icon={FaCreditCard}
          color="#A97C78"
          subtitle={`${activePercentage}% of total`}
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats.total_revenue)}
          icon={FaDollarSign}
          color="#8B6B6B"
        />
        <StatCard
          title="Monthly Revenue"
          value={formatCurrency(stats.monthly_revenue)}
          icon={FaChartLine}
          color="#6B4F4F"
        />
      </div>

      {/* Status Breakdown */}
      <div className="status-breakdown-section">
        <h2 className="admin-section-title">Subscription Status Breakdown</h2>
        <div className="progress-grid">
          <ProgressBar 
            percentage={activePercentage} 
            color="#10b981" 
            label="Active" 
            count={stats.active_subscriptions} 
          />
          <ProgressBar 
            percentage={expiredPercentage} 
            color="#f59e0b" 
            label="Expired" 
            count={stats.expired_subscriptions} 
          />
          <ProgressBar 
            percentage={cancelledPercentage} 
            color="#ef4444" 
            label="Cancelled" 
            count={stats.cancelled_subscriptions} 
          />
          <ProgressBar 
            percentage={pendingPercentage} 
            color="#3b82f6" 
            label="Pending" 
            count={stats.pending_subscriptions} 
          />
        </div>
      </div>

      {/* Controls Section */}
      <div className="admin-controls">
        <div className="search-filter-section">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search by user name, email, or plan..."
              value={searchTerm}
              onChange={handleSearch}
              className="search-input"
            />
          </div>
          
          <div className="filter-section">
            <FaFilter className="filter-icon" />
            <select
              value={filterStatus}
              onChange={handleFilterChange}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="cancelled">Cancelled</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>

        <div className="action-buttons">
          <button className="export-btn" onClick={() => window.print()}>
            <FaDownload /> Export Data
          </button>
          <button className="add-btn">
            <FaPlus /> Add Subscription
          </button>
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="subscriptions-table-container">
        <table className="subscriptions-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Plan</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSubscriptions.map((subscription) => (
              <tr key={subscription.id} className="subscription-row">
                <td className="user-info">
                  <div className="user-details">
                    <div className="user-name">{subscription.user_name}</div>
                    <div className="user-email">{subscription.user_email}</div>
                  </div>
                </td>
                <td className="plan-info">
                  <div className="plan-name">{subscription.plan_name}</div>
                  <div className="plan-details">{subscription.plan_details}</div>
                </td>
                <td className="amount">
                  {formatCurrency(subscription.amount)}
                </td>
                <td className="status">
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(subscription.status) }}
                  >
                    {getStatusText(subscription.status)}
                  </span>
                </td>
                <td className="start-date">
                  {formatDate(subscription.start_date)}
                </td>
                <td className="end-date">
                  {formatDate(subscription.end_date)}
                </td>
                <td className="actions">
                  <button
                    className="action-btn view-btn"
                    onClick={() => setSelectedSubscription(subscription)}
                    title="View Details"
                  >
                    <FaEye />
                  </button>
                  <button
                    className="action-btn edit-btn"
                    onClick={() => handleEditSubscription(subscription)}
                    title="Edit Subscription"
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="action-btn delete-btn"
                    onClick={() => handleDeleteSubscription(subscription)}
                    title="Delete Subscription"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredSubscriptions.length === 0 && (
          <div className="no-subscriptions">
            <p>No subscriptions found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && selectedSubscription && (
        <EditSubscriptionModal
          subscription={selectedSubscription}
          onClose={() => setShowEditModal(false)}
          onUpdate={handleUpdateSubscription}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedSubscription && (
        <DeleteConfirmationModal
          subscription={selectedSubscription}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteConfirm}
        />
      )}

      {/* Subscription Details Modal */}
      {selectedSubscription && !showEditModal && !showDeleteModal && (
        <SubscriptionDetailsModal
          subscription={selectedSubscription}
          onClose={() => setSelectedSubscription(null)}
        />
      )}
    </div>
  );
};

// Edit Subscription Modal Component
const EditSubscriptionModal = ({ subscription, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    status: subscription.status,
    start_date: subscription.start_date?.split('T')[0],
    end_date: subscription.end_date?.split('T')[0],
    amount: subscription.amount / 100,
    notes: subscription.notes || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate({
      ...formData,
      amount: Math.round(formData.amount * 100)
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Edit Subscription</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="edit-form">
          <div className="form-group">
            <label>Status:</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value})}
            >
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="cancelled">Cancelled</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          <div className="form-group">
            <label>Start Date:</label>
            <input
              type="date"
              value={formData.start_date}
              onChange={(e) => setFormData({...formData, start_date: e.target.value})}
            />
          </div>

          <div className="form-group">
            <label>End Date:</label>
            <input
              type="date"
              value={formData.end_date}
              onChange={(e) => setFormData({...formData, end_date: e.target.value})}
            />
          </div>

          <div className="form-group">
            <label>Amount ($):</label>
            <input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value)})}
            />
          </div>

          <div className="form-group">
            <label>Notes:</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              rows="3"
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="save-btn">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Delete Confirmation Modal Component
const DeleteConfirmationModal = ({ subscription, onClose, onConfirm }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content delete-modal">
        <div className="modal-header">
          <h2>Delete Subscription</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="delete-content">
          <p>Are you sure you want to delete this subscription?</p>
          <div className="subscription-summary">
            <p><strong>User:</strong> {subscription.user_name}</p>
            <p><strong>Plan:</strong> {subscription.plan_name}</p>
            <p><strong>Amount:</strong> ${(subscription.amount / 100).toFixed(2)}</p>
          </div>
          <p className="warning">This action cannot be undone.</p>
        </div>

        <div className="modal-actions">
          <button className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button className="delete-btn" onClick={onConfirm}>
            Delete Subscription
          </button>
        </div>
      </div>
    </div>
  );
};

// Subscription Details Modal Component
const SubscriptionDetailsModal = ({ subscription, onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content details-modal">
        <div className="modal-header">
          <h2>Subscription Details</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="subscription-details">
          <div className="detail-section">
            <h3>User Information</h3>
            <p><strong>Name:</strong> {subscription.user_name}</p>
            <p><strong>Email:</strong> {subscription.user_email}</p>
            <p><strong>User ID:</strong> {subscription.user_id}</p>
          </div>

          <div className="detail-section">
            <h3>Plan Information</h3>
            <p><strong>Plan:</strong> {subscription.plan_name}</p>
            <p><strong>Details:</strong> {subscription.plan_details}</p>
            <p><strong>Amount:</strong> ${(subscription.amount / 100).toFixed(2)}</p>
          </div>

          <div className="detail-section">
            <h3>Subscription Details</h3>
            <p><strong>Status:</strong> {subscription.status}</p>
            <p><strong>Start Date:</strong> {new Date(subscription.start_date).toLocaleDateString()}</p>
            <p><strong>End Date:</strong> {new Date(subscription.end_date).toLocaleDateString()}</p>
            <p><strong>Created:</strong> {new Date(subscription.created_at).toLocaleDateString()}</p>
          </div>

          {subscription.notes && (
            <div className="detail-section">
              <h3>Notes</h3>
              <p>{subscription.notes}</p>
            </div>
          )}
        </div>

        <div className="modal-actions">
          <button className="close-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSubscriptions; 