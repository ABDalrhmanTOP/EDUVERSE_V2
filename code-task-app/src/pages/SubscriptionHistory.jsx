import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/axios';
import '../styles/SubscriptionHistory.css';

const SubscriptionHistory = () => {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSubscriptionHistory();
  }, []);

  const fetchSubscriptionHistory = async () => {
    try {
      const response = await apiClient.get('/subscription-history');

      if (response.status === 200) {
        const data = response.data;
        setSubscriptions(data.subscriptions);
      } else {
        setError('فشل في تحميل سجل الاشتراك');
      }
    } catch (err) {
      setError('خطأ في الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return '#10b981';
      case 'cancelled':
        return '#ef4444';
      case 'expired':
        return '#f59e0b';
      case 'pending':
        return '#3b82f6';
      default:
        return '#6b7280';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active':
        return 'نشط';
      case 'cancelled':
        return 'ملغي';
      case 'expired':
        return 'منتهي الصلاحية';
      case 'pending':
        return 'في الانتظار';
      default:
        return 'غير معروف';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount, currency) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: currency || 'USD'
    }).format(amount / 100);
  };

  if (loading) {
    return (
      <div className="subscription-history-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>جاري تحميل سجل الاشتراك...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="subscription-history-container">
        <div className="error-message">
          <h3>خطأ في التحميل</h3>
          <p>{error}</p>
          <button onClick={fetchSubscriptionHistory} className="retry-button">
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="subscription-history-container">
      <div className="history-header">
        <h1>سجل الاشتراك</h1>
        <p>عرض جميع اشتراكاتك السابقة والحالية</p>
      </div>

      {subscriptions.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>لا توجد اشتراكات</h3>
          <p>لم تقم بأي اشتراك بعد. ابدأ رحلتك التعليمية الآن!</p>
          <button 
            className="subscribe-now-btn"
            onClick={() => window.location.href = '/subscription-plans'}
          >
            اشترك الآن
          </button>
        </div>
      ) : (
        <div className="subscriptions-list">
          {subscriptions.map((subscription) => (
            <div key={subscription.id} className="subscription-card">
              <div className="subscription-header">
                <div className="plan-info">
                  <h3>{subscription.plan_name}</h3>
                  <p className="plan-description">{subscription.plan_description}</p>
                </div>
                <div 
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(subscription.status) }}
                >
                  {getStatusText(subscription.status)}
                </div>
              </div>

              <div className="subscription-details">
                <div className="detail-row">
                  <span className="detail-label">المبلغ:</span>
                  <span className="detail-value">
                    {formatCurrency(subscription.amount, subscription.currency)}
                  </span>
                </div>
                
                <div className="detail-row">
                  <span className="detail-label">تاريخ البداية:</span>
                  <span className="detail-value">
                    {formatDate(subscription.start_date)}
                  </span>
                </div>

                <div className="detail-row">
                  <span className="detail-label">تاريخ الانتهاء:</span>
                  <span className="detail-value">
                    {formatDate(subscription.end_date)}
                  </span>
                </div>

                {subscription.payment_method && (
                  <div className="detail-row">
                    <span className="detail-label">طريقة الدفع:</span>
                    <span className="detail-value">
                      {subscription.payment_method}
                    </span>
                  </div>
                )}

                {subscription.transaction_id && (
                  <div className="detail-row">
                    <span className="detail-label">رقم المعاملة:</span>
                    <span className="detail-value transaction-id">
                      {subscription.transaction_id}
                    </span>
                  </div>
                )}
              </div>

              {subscription.status === 'active' && (
                <div className="subscription-actions">
                  <button className="action-btn cancel-btn">
                    إلغاء الاشتراك
                  </button>
                  <button className="action-btn upgrade-btn">
                    ترقية الباقة
                  </button>
                </div>
              )}

              {subscription.status === 'cancelled' && (
                <div className="cancellation-info">
                  <p>تم إلغاء هذا الاشتراك في {formatDate(subscription.cancelled_at)}</p>
                  {subscription.cancellation_reason && (
                    <p>السبب: {subscription.cancellation_reason}</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="history-summary">
        <div className="summary-card">
          <h4>إجمالي المدفوعات</h4>
          <p className="total-amount">
            {formatCurrency(
              subscriptions.reduce((sum, sub) => sum + sub.amount, 0),
              'USD'
            )}
          </p>
        </div>
        
        <div className="summary-card">
          <h4>عدد الاشتراكات</h4>
          <p className="total-count">{subscriptions.length}</p>
        </div>
        
        <div className="summary-card">
          <h4>الاشتراك الحالي</h4>
          <p className="current-status">
            {subscriptions.find(sub => sub.status === 'active') 
              ? 'نشط' 
              : 'لا يوجد'
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionHistory; 