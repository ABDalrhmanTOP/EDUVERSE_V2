import React, { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { FaSearch, FaEdit, FaTrash, FaEye, FaFilter, FaDownload, FaPlus, FaUsers, FaCreditCard, FaChartLine, FaDollarSign, FaCalendarAlt } from 'react-icons/fa';
import '../../styles/admin/AdminSubscriptions.css';
import { useTranslation } from 'react-i18next';

function safeRender(val) {
  if (val == null) return '';
  if (typeof val === 'string' || typeof val === 'number') return val;
  if (React.isValidElement(val)) return val;
  console.error('Tried to render object as React child:', val);
  return JSON.stringify(val);
}

const AdminSubscriptions = () => {
  const { t, i18n } = useTranslation();
  console.log('DEBUG: i18n.language =', i18n.language);
  console.log('DEBUG: t("admin.subscriptions.title") =', t('admin.subscriptions.title'));
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

  useEffect(() => {
    fetchData();
  }, [i18n.language]);

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

  // Status translation helper (must be inside component to access t)
  const getStatusText = (status) => {
    switch (status) {
      case 'active': return t('admin.subscriptions.active');
      case 'expired': return t('admin.subscriptions.expired');
      case 'cancelled': return t('admin.subscriptions.cancelled');
      case 'pending': return t('admin.subscriptions.pending');
      default: return t('admin.subscriptions.unknown') || 'Unknown';
    }
  };

  // Locale-aware date and currency formatting
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat(i18n.language === 'ar' ? 'ar-EG' : 'en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100);
  };
  const formatNumber = (num) => {
    return new Intl.NumberFormat(i18n.language === 'ar' ? 'ar-EG' : 'en-US').format(num);
  };

  // Statistics Components
  const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <div className="admin-stat-card" style={{ '--card-color': color }}>
      <div className="admin-stat-icon">
        {React.createElement(Icon, { size: 32, color })}
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
      <div className="admin-welcome-section">
        <h1 className="admin-welcome-title">{t('admin.subscriptions.title')}</h1>
        <p className="admin-welcome-subtitle">{t('admin.subscriptions.subtitle')}</p>
      </div>

      {error && (
        <div className="error-message">
          {t('admin.subscriptions.error')}: {error}
        </div>
      )}

      {/* Statistics Section */}
      <div className="admin-stats-grid">
        <StatCard
          title={t('admin.subscriptions.total')}
          value={formatNumber(stats.total_subscriptions)}
          icon={FaUsers}
          color="#C89F9C"
        />
        <StatCard
          title={t('admin.subscriptions.active')}
          value={formatNumber(stats.active_subscriptions)}
          icon={FaCreditCard}
          color="#A97C78"
          subtitle={`${activePercentage}% ${t('admin.subscriptions.ofTotal')}`}
        />
        <StatCard
          title={t('admin.subscriptions.totalRevenue')}
          value={formatCurrency(stats.total_revenue)}
          icon={FaDollarSign}
          color="#8B6B6B"
        />
        <StatCard
          title={t('admin.subscriptions.monthlyRevenue')}
          value={formatCurrency(stats.monthly_revenue)}
          icon={FaChartLine}
          color="#6B4F4F"
        />
      </div>

      {/* Status Breakdown */}
      <div className="status-breakdown-section">
        <h2 className="admin-section-title">{t('admin.subscriptions.statusBreakdown')}</h2>
        <div className="progress-grid">
          <ProgressBar 
            percentage={activePercentage} 
            color="#10b981" 
            label={t('admin.subscriptions.active')}
            count={stats.active_subscriptions} 
          />
          <ProgressBar 
            percentage={expiredPercentage} 
            color="#f59e0b" 
            label={t('admin.subscriptions.expired')}
            count={stats.expired_subscriptions} 
          />
          <ProgressBar 
            percentage={cancelledPercentage} 
            color="#ef4444" 
            label={t('admin.subscriptions.cancelled')}
            count={stats.cancelled_subscriptions} 
          />
          <ProgressBar 
            percentage={pendingPercentage} 
            color="#3b82f6" 
            label={t('admin.subscriptions.pending')}
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
              placeholder={t('admin.subscriptions.searchPlaceholder')}
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
              <option value="all">{t('admin.subscriptions.allStatus')}</option>
              <option value="active">{t('admin.subscriptions.active')}</option>
              <option value="expired">{t('admin.subscriptions.expired')}</option>
              <option value="cancelled">{t('admin.subscriptions.cancelled')}</option>
              <option value="pending">{t('admin.subscriptions.pending')}</option>
            </select>
          </div>
        </div>

        <div className="action-buttons">
          <button className="export-btn" onClick={() => window.print()}>
            <FaDownload /> {t('admin.subscriptions.exportData')}
          </button>
          <button className="add-btn">
            <FaPlus /> {t('admin.subscriptions.addSubscription')}
          </button>
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="subscriptions-table-container">
        <table className="subscriptions-table">
          <thead>
            <tr>
              <th>{t('admin.subscriptions.user')}</th>
              <th>{t('admin.subscriptions.plan')}</th>
              <th>{t('admin.subscriptions.amount')}</th>
              <th>{t('admin.subscriptions.status')}</th>
              <th>{t('admin.subscriptions.startDate')}</th>
              <th>{t('admin.subscriptions.endDate')}</th>
              <th>{t('admin.subscriptions.actions')}</th>
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
                  <div className="plan-details">{safeRender(subscription.plan_details)}</div>
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
                    title={t('admin.subscriptions.viewDetails')}
                  >
                    <FaEye />
                  </button>
                  <button
                    className="action-btn edit-btn"
                    onClick={() => handleEditSubscription(subscription)}
                    title={t('admin.subscriptions.editSubscription')}
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="action-btn delete-btn"
                    onClick={() => handleDeleteSubscription(subscription)}
                    title={t('admin.subscriptions.deleteSubscription')}
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
            <p>{t('admin.subscriptions.noResults')}</p>
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
  const { t } = useTranslation();
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
          <h2>{t('admin.subscriptions.editSubscription')}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="edit-form">
          <div className="form-group">
            <label>{t('admin.subscriptions.status')}:</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value})}
            >
              <option value="active">{t('admin.subscriptions.active')}</option>
              <option value="expired">{t('admin.subscriptions.expired')}</option>
              <option value="cancelled">{t('admin.subscriptions.cancelled')}</option>
              <option value="pending">{t('admin.subscriptions.pending')}</option>
            </select>
          </div>

          <div className="form-group">
            <label>{t('admin.subscriptions.startDate')}:</label>
            <input
              type="date"
              value={formData.start_date}
              onChange={(e) => setFormData({...formData, start_date: e.target.value})}
            />
          </div>

          <div className="form-group">
            <label>{t('admin.subscriptions.endDate')}:</label>
            <input
              type="date"
              value={formData.end_date}
              onChange={(e) => setFormData({...formData, end_date: e.target.value})}
            />
          </div>

          <div className="form-group">
            <label>{t('admin.subscriptions.amount')}:</label>
            <input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value)})}
            />
          </div>

          <div className="form-group">
            <label>{t('admin.subscriptions.notes')}:</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              rows="3"
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              {t('admin.subscriptions.cancel')}
            </button>
            <button type="submit" className="save-btn">
              {t('admin.subscriptions.saveChanges')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Delete Confirmation Modal Component
const DeleteConfirmationModal = ({ subscription, onClose, onConfirm }) => {
  const { t } = useTranslation();
  return (
    <div className="modal-overlay">
      <div className="modal-content delete-modal">
        <div className="modal-header">
          <h2>{t('admin.subscriptions.deleteSubscription')}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="delete-content">
          <p>{t('admin.subscriptions.deleteConfirmation')}</p>
          <div className="subscription-summary">
            <p><strong>{t('admin.subscriptions.user')}:</strong> {subscription.user_name}</p>
            <p><strong>{t('admin.subscriptions.plan')}:</strong> {subscription.plan_name}</p>
            <p><strong>{t('admin.subscriptions.amount')}:</strong> ${(subscription.amount / 100).toFixed(2)}</p>
          </div>
          <p className="warning">{t('admin.subscriptions.deleteWarning')}</p>
        </div>

        <div className="modal-actions">
          <button className="cancel-btn" onClick={onClose}>
            {t('admin.subscriptions.cancel')}
          </button>
          <button className="delete-btn" onClick={onConfirm}>
            {t('admin.subscriptions.deleteSubscription')}
          </button>
        </div>
      </div>
    </div>
  );
};

// Subscription Details Modal Component
const SubscriptionDetailsModal = ({ subscription, onClose }) => {
  const { t } = useTranslation();
  return (
    <div className="modal-overlay">
      <div className="modal-content details-modal">
        <div className="modal-header">
          <h2>{t('admin.subscriptions.subscriptionDetails')}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="subscription-details">
          <div className="detail-section">
            <h3>{t('admin.subscriptions.userInfo')}</h3>
            <p><strong>{t('admin.subscriptions.name')}:</strong> {subscription.user_name}</p>
            <p><strong>{t('admin.subscriptions.email')}:</strong> {subscription.user_email}</p>
            <p><strong>{t('admin.subscriptions.userId')}:</strong> {subscription.user_id}</p>
          </div>

          <div className="detail-section">
            <h3>{t('admin.subscriptions.planInfo')}</h3>
            <p><strong>{t('admin.subscriptions.plan')}:</strong> {subscription.plan_name}</p>
            <p><strong>{t('admin.subscriptions.details')}:</strong> {subscription.plan_details}</p>
            <p><strong>{t('admin.subscriptions.amount')}:</strong> ${(subscription.amount / 100).toFixed(2)}</p>
          </div>

          <div className="detail-section">
            <h3>{t('admin.subscriptions.subscriptionDetails')}</h3>
            <p><strong>{t('admin.subscriptions.status')}:</strong> {subscription.status}</p>
            <p><strong>{t('admin.subscriptions.startDate')}:</strong> {new Date(subscription.start_date).toLocaleDateString()}</p>
            <p><strong>{t('admin.subscriptions.endDate')}:</strong> {new Date(subscription.end_date).toLocaleDateString()}</p>
            <p><strong>{t('admin.subscriptions.created')}:</strong> {new Date(subscription.created_at).toLocaleDateString()}</p>
          </div>

          {subscription.notes && (
            <div className="detail-section">
              <h3>{t('admin.subscriptions.notes')}</h3>
              <p>{safeRender(subscription.notes)}</p>
            </div>
          )}
        </div>

        <div className="modal-actions">
          <button className="close-btn" onClick={onClose}>
            {t('admin.subscriptions.close')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSubscriptions; 