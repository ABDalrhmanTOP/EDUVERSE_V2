import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/axios';
import '../styles/SubscriptionHistory.css';

const SubscriptionHistory = () => {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    fetchSubscriptionHistory();
  }, []);

  const fetchSubscriptionHistory = async () => {
    try {
      const response = await apiClient.get('/subscription-history');
      if (response.status === 200) {
        setSubscriptions(response.data.subscriptions);
      } else {
        setError('Failed to load subscription history');
      }
    } catch (err) {
      setError('Server connection error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#10b981';
      case 'cancelled': return '#ef4444';
      case 'expired': return '#f59e0b';
      case 'pending': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Active';
      case 'cancelled': return 'Cancelled';
      case 'expired': return 'Expired';
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

  const formatCurrency = (amount, currency) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD'
    }).format(amount / 100);
  };

  // Summary calculations
  const calculateTotalSubscriptions = () =>
    subscriptions.reduce((total, sub) => total + (typeof sub.amount === 'number' ? sub.amount : 0), 0);

  const calculateActiveSubscriptionsTotal = () =>
    subscriptions.reduce((total, sub) => sub?.status === 'active' ? total + (typeof sub.amount === 'number' ? sub.amount : 0) : total, 0);

  const calculateTotalRemainingCourses = () =>
    subscriptions.reduce((total, sub) => total + (sub?.status === 'active' && typeof sub.total_remaining_courses === 'number' ? sub.total_remaining_courses : 0), 0);

  const calculateTotalUsedCourses = () =>
    subscriptions.reduce((total, sub) => total + (sub?.status === 'active' && typeof sub.total_used_courses === 'number' ? sub.total_used_courses : 0), 0);

  const activeSubscription = subscriptions.find(sub => sub?.status === 'active');

  if (loading) {
    return (
      <div className="subscription-history-container">
        <div><p>Loading subscription history ...</p></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="subscription-history-container">
        <div className="error-message">
          <h3>Loading Error</h3>
          <p>{error}</p>
          <button onClick={fetchSubscriptionHistory} className="retry-button">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="subscription-history-container" style={{ background: '#f8fafc', minHeight: '100vh', padding: '0 0 40px 0' }}>
      {/* Header */}
          <div style={{
        background: 'linear-gradient(90deg, #e3cfa4 0%, #f5f1eb 100%)',
        padding: '2.5rem 0 1.5rem 0',
              textAlign: 'center',
        borderBottom: '2px solid #e3cfa4',
        marginBottom: '2.5rem',
        boxShadow: '0 2px 12px #e3cfa422',
      }}>
        <h1 style={{ color: '#7d6a4d', fontWeight: 900, fontSize: '2.2rem', letterSpacing: '1px', margin: 0, display: 'inline-flex', alignItems: 'center', gap: 12 }}>
          <span role="img" aria-label="history">📜</span> Subscription History
        </h1>
        <p style={{ color: '#b5a079', fontSize: '1.15rem', marginTop: 10 }}>View all your previous and current subscriptions in one place</p>
            </div>
            
      {/* Summary Section */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', marginTop: '1.5rem', gap: '2.5rem', flexWrap: 'wrap' }}>
        <div className="summary-item" style={{ textAlign: 'center', background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px #e3cfa422', padding: '1.2rem 2.2rem', minWidth: 180, margin: '0.5rem' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#b5a079', marginBottom: '0.5rem' }}>{subscriptions.length}</div>
          <div style={{ fontSize: '0.95rem', color: '#7d6a4d', fontWeight: '500' }}>Total Subscriptions</div>
              </div>
        <div className="summary-item" style={{ textAlign: 'center', background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px #e3cfa422', padding: '1.2rem 2.2rem', minWidth: 180, margin: '0.5rem' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#b5a079', marginBottom: '0.5rem' }}>{formatCurrency(calculateTotalSubscriptions(), 'USD')}</div>
          <div style={{ fontSize: '0.95rem', color: '#7d6a4d', fontWeight: '500' }}>Total Amount</div>
            </div>
        <div className="summary-item" style={{ textAlign: 'center', background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px #e3cfa422', padding: '1.2rem 2.2rem', minWidth: 180, margin: '0.5rem' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#b5a079', marginBottom: '0.5rem' }}>{subscriptions.filter(sub => sub?.status === 'active').length}</div>
          <div style={{ fontSize: '0.95rem', color: '#7d6a4d', fontWeight: '500' }}>Active Plans</div>
              </div>
        <div className="summary-item" style={{ textAlign: 'center', background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px #e3cfa422', padding: '1.2rem 2.2rem', minWidth: 180, margin: '0.5rem' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#b5a079', marginBottom: '0.5rem' }}>{calculateTotalRemainingCourses()}</div>
          <div style={{ fontSize: '0.95rem', color: '#7d6a4d', fontWeight: '500' }}>Available Courses</div>
        </div>
      </div>

      {/* Current Subscription Card */}
      {activeSubscription && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', marginTop: '2.5rem', marginBottom: '2.5rem' }}>
          <div className="current-subscription-card" style={{ maxWidth: '440px', width: '100%', background: 'linear-gradient(135deg, #f5f1eb 0%, #e3cfa4 100%)', borderRadius: '20px', boxShadow: '0 8px 32px #b5a07933', padding: '2.2rem 1.7rem', border: '2.5px solid #b5a079', position: 'relative', fontFamily: 'Tahoma, Arial, sans-serif', transition: 'box-shadow 0.2s', cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 12px 40px #b5a07955'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = '0 8px 32px #b5a07933'}>
            <div style={{ position: 'absolute', top: 18, right: 18, fontSize: '2.2rem', color: '#b5a079' }}>⭐</div>
          <div className="subscription-card active">
              <div className="subscription-header" style={{ display: 'flex', alignItems: 'center', marginBottom: '1.2rem' }}>
                <div className="plan-info" style={{ flex: 1 }}>
                  <h2 style={{ margin: 0, color: '#7d6a4d', fontWeight: 800, fontSize: '1.45rem', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span role="img" aria-label="star">🌟</span> Current Subscription
                  </h2>
                  <div style={{ color: '#b5a079', fontSize: '1.08rem', marginTop: 4, fontWeight: 600 }}>{activeSubscription.plan_name}</div>
              </div>
                <div className="status-badge" style={{ backgroundColor: getStatusColor(activeSubscription?.status), color: '#fff', padding: '7px 20px', borderRadius: '14px', fontWeight: 'bold', fontSize: '1.05rem', marginLeft: 12, boxShadow: '0 2px 8px #b5a07933' }}>{getStatusText(activeSubscription?.status)}</div>
              </div>
              <div className="subscription-details" style={{ fontSize: '1.13rem', color: '#7d6a4d', fontWeight: 500 }}>
                <div className="detail-row" style={{ marginBottom: 10, display: 'flex', alignItems: 'center' }}>
                  <span className="detail-label" style={{ fontWeight: 700, color: '#b5a079', minWidth: 120 }}>Start Date:</span>
                  <span className="detail-value" style={{ marginLeft: 8 }}>{formatDate(activeSubscription.start_date)}</span>
            </div>
                <div className="detail-row" style={{ marginBottom: 10, display: 'flex', alignItems: 'center' }}>
                  <span className="detail-label" style={{ fontWeight: 700, color: '#b5a079', minWidth: 120 }}>End Date:</span>
                  <span className="detail-value" style={{ marginLeft: 8 }}>{formatDate(activeSubscription.end_date)}</span>
              </div>
                <div className="detail-row" style={{ marginBottom: 10, display: 'flex', alignItems: 'center' }}>
                  <span className="detail-label" style={{ fontWeight: 700, color: '#b5a079', minWidth: 120 }}>Allowed Courses:</span>
                  <span className="detail-value" style={{ marginLeft: 8 }}>{activeSubscription.total_allowed_courses}</span>
              </div>
                <div className="detail-row" style={{ display: 'flex', alignItems: 'center' }}>
                  <span className="detail-label" style={{ fontWeight: 700, color: '#b5a079', minWidth: 120 }}>Remaining Courses:</span>
                  <span className="detail-value" style={{ marginLeft: 8 }}>{activeSubscription.total_remaining_courses !== undefined ? activeSubscription.remaining_courses : '-'}</span>
              </div>
              </div>
              <button style={{ marginTop: 18, background: 'linear-gradient(90deg, #b5a079 0%, #e3cfa4 100%)', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 28px', fontWeight: 700, fontSize: '1.08rem', cursor: 'pointer', boxShadow: '0 2px 8px #e3cfa455', transition: 'background 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'linear-gradient(90deg, #e3cfa4 0%, #b5a079 100%)'}
                onMouseLeave={e => e.currentTarget.style.background = 'linear-gradient(90deg, #b5a079 0%, #e3cfa4 100%)'}
                onClick={() => window.location.href = '/subscription-plans'}>
                Renew / Upgrade
              </button>
            </div>
          </div>
        </div>
      )}

      {/* إحصائية إجمالية أعلى الصفحة */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '2.5rem',
        margin: '2.5rem 0 1.5rem 0',
        flexWrap: 'wrap',
      }}>
        <div className="summary-item" style={{ textAlign: 'center', background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px #e3cfa422', padding: '1.2rem 2.2rem', minWidth: 180, margin: '0.5rem' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#b5a079', marginBottom: '0.5rem' }}>{calculateTotalUsedCourses()}</div>
          <div style={{ fontSize: '0.95rem', color: '#7d6a4d', fontWeight: '500' }}>Total Used</div>
        </div>
        <div className="summary-item" style={{ textAlign: 'center', background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px #e3cfa422', padding: '1.2rem 2.2rem', minWidth: 180, margin: '0.5rem' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#b5a079', marginBottom: '0.5rem' }}>{calculateTotalRemainingCourses()}</div>
          <div style={{ fontSize: '0.95rem', color: '#7d6a4d', fontWeight: '500' }}>Total Remaining</div>
        </div>
        <div className="summary-item" style={{ textAlign: 'center', background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px #e3cfa422', padding: '1.2rem 2.2rem', minWidth: 180, margin: '0.5rem' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#b5a079', marginBottom: '0.5rem' }}>{calculateTotalUsedCourses()}</div>
          <div style={{ fontSize: '0.95rem', color: '#7d6a4d', fontWeight: '500' }}>Total Allowed</div>
        </div>
      </div>

      {/* بطاقات الاشتراكات النشطة */}
      {subscriptions && subscriptions.length > 0 && (
        <div style={{ marginTop: '2.5rem' }}>
          <h2 className="section-title" style={{ color: '#b5a079', fontWeight: 800, fontSize: '1.25rem', marginBottom: '1.2rem', textAlign: 'center', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
            <span role="img" aria-label="cards">💳</span> Active Subscriptions
          </h2>
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: '2rem', justifyContent: 'center', alignItems: 'stretch',
          }}>
            {subscriptions.map((sub) => (
              <div key={sub.id} className={"subscription-card" + (sub?.status === 'active' ? ' active' : '')} style={{
                minWidth: 340,
                maxWidth: 400,
                flex: '1 1 340px',
                marginBottom: '1.5rem',
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              }}>
                <div style={{ position: 'absolute', top: 18, right: 18, fontSize: '1.7rem', color: '#b5a079' }}>💳</div>
                <div style={{ marginBottom: 12 }}>
                  <div className="subscription-header" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <span className={"status-badge " + (sub?.status === 'active' ? 'active' : '')} style={{ backgroundColor: getStatusColor(sub?.status), color: '#fff', padding: '4px 14px', borderRadius: '8px', fontWeight: 'bold', letterSpacing: '0.5px', fontSize: '0.98rem' }}>{getStatusText(sub?.status)}</span>
                    <span className="plan-info" style={{ color: '#b5a079', fontWeight: 700, fontSize: '1.08rem' }}>{sub.plan_name}</span>
          </div>
                  <div className="subscription-details">
                    <div className="detail-row"><span className="detail-label">Start:</span> <span className="detail-value">{formatDate(sub.start_date)}</span></div>
                    <div className="detail-row"><span className="detail-label">End:</span> <span className="detail-value">{formatDate(sub.end_date)}</span></div>
                    <div className="detail-row"><span className="detail-label">Allowed:</span> <span className="detail-value">{sub.allowed_courses}</span></div>
                    <div className="detail-row"><span className="detail-label">Remaining:</span> <span className="detail-value">{sub.remaining_courses !== undefined ? sub.remaining_courses : '-'}</span></div>
                    {sub.amount && (
                      <div className="detail-row"><span className="detail-label">Amount:</span> <span className="detail-value">{formatCurrency(sub.amount, sub.currency)}</span></div>
                    )}
          </div>
                </div>
                <div className="subscription-actions" style={{ marginTop: 10, display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                  <button className="action-btn upgrade-btn" onClick={() => window.location.href = '/subscription-plans'}>Renew / Upgrade</button>
              </div>
            </div>
          ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionHistory; 