import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/axios';
import '../styles/SubscriptionHistory.css';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const SubscriptionHistory = () => {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    fetchSubscriptionHistory();
    fetchCurrentSubscription();
  }, []);

  useEffect(() => {
    console.log('useEffect triggered, subscriptions length:', subscriptions.length);
    checkScrollButtons();
    window.addEventListener('resize', checkScrollButtons);
    return () => window.removeEventListener('resize', checkScrollButtons);
  }, [subscriptions]);

  const checkScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      console.log('Scroll check:', { scrollLeft, scrollWidth, clientWidth });
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
      console.log('Can scroll left:', scrollLeft > 0, 'Can scroll right:', scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  const scrollLeft = () => {
    console.log('scrollLeft function called');
    if (scrollContainerRef.current) {
      console.log('Scrolling left, container found');
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    } else {
      console.log('scrollContainerRef.current is null');
    }
  };

  const scrollRight = () => {
    console.log('scrollRight function called');
    if (scrollContainerRef.current) {
      console.log('Scrolling right, container found');
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    } else {
      console.log('scrollContainerRef.current is null');
    }
  };

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

  const fetchCurrentSubscription = async () => {
    try {
      const response = await apiClient.get('/subscription/status');
      if (response.status === 200) {
        setCurrentSubscription(response.data);
      }
    } catch (err) {
      console.error('Error fetching current subscription:', err);
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
    return new Date(dateString).toLocaleDateString('en-SA', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount, currency) => {
    return new Intl.NumberFormat('en-SA', {
      style: 'currency',
      currency: currency || 'USD'
    }).format(amount / 100);
  };


  const calculateTotalSubscriptions = () => {
    if (!subscriptions || subscriptions.length === 0) return 0;
    
    return subscriptions.reduce((total, subscription) => {
      // تأكد من أن المبلغ رقم صحيح
      const amount = typeof subscription.amount === 'number' ? subscription.amount : 0;
      return total + amount;
    }, 0);
  };

  // حساب مجموع الاشتراكات النشطة فقط
  const calculateActiveSubscriptionsTotal = () => {
    if (!subscriptions || subscriptions.length === 0) return 0;
    
    return subscriptions.reduce((total, subscription) => {
      if (subscription?.status === 'active') {
        const amount = typeof subscription.amount === 'number' ? subscription.amount : 0;
        return total + amount;
      }
      return total;
    }, 0);
  };

  // حساب إجمالي الكورسات المتبقية من جميع الاشتراكات النشطة
  const calculateTotalRemainingCourses = () => {
    let totalRemaining = 0;
    
    // إضافة الكورسات المتبقية من الاشتراك الحالي
    if (currentSubscription && currentSubscription.has_active_subscription) {
      totalRemaining += currentSubscription.remaining_courses || 0;
    }
    
    // إضافة الكورسات المتبقية من الاشتراكات الأخرى النشطة
    if (subscriptions && subscriptions.length > 0) {
      subscriptions.forEach(subscription => {
        if (subscription?.status === 'active') {
        
          if (subscription.used_courses === 0 || subscription.used_courses === undefined) {
            totalRemaining += 1; // كورس واحد متاح لكل اشتراك نشط
          }
        }
      });
    }
    
    return totalRemaining;
  };

  // حساب إجمالي الكورسات المستخدمة من جميع الاشتراكات النشطة
  const calculateTotalUsedCourses = () => {
    let totalUsed = 0;
    
    // إضافة الكورسات المستخدمة من الاشتراك الحالي
    if (currentSubscription && currentSubscription.has_active_subscription) {
      totalUsed += currentSubscription.used_courses || 0;
    }
    
    // إضافة الكورسات المستخدمة من الاشتراكات الأخرى النشطة
    if (subscriptions && subscriptions.length > 0) {
      subscriptions.forEach(subscription => {
        if (subscription?.status === 'active') {
          if (subscription.used_courses !== undefined) {
            totalUsed += subscription.used_courses;
          }
        }
      });
    }
    
    return totalUsed;
  };

  // حساب إجمالي الاشتراكات النشطة (كل اشتراك نشط = كورس واحد)
  const calculateTotalActiveSubscriptions = () => {
    let totalActive = 0;
    
    // إضافة الاشتراك الحالي إذا كان نشط
    if (currentSubscription && currentSubscription.has_active_subscription) {
      totalActive += 1;
    }
    
    // إضافة الاشتراكات النشطة الأخرى
    if (subscriptions && subscriptions.length > 0) {
      subscriptions.forEach(subscription => {
        if (subscription?.status === 'active') {
          totalActive += 1;
        }
      });
    }
    
    return totalActive;
  };

  const activeSubscription = subscriptions.find(sub => sub?.status === 'active');

  if (loading) {
    return (
      <div className="subscription-history-container">
       <div>
          <p>Loading subscription history ...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="subscription-history-container">
        <div className="error-message">
          <h3>Loading Error</h3>
          <p>{error}</p>
          <button onClick={fetchSubscriptionHistory} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="subscription-history-container">
      <div className="history-header">
        <h1>Subscription History</h1>
        <p>View all your previous and current subscriptions</p>
        
        {subscriptions.length > 0 && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            marginTop: '2.5rem'
          }}>
            <div className="subscription-summary" style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '3rem',
              padding: '2.5rem 3rem',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(245,241,235,0.8))',
              borderRadius: '25px',
              border: '2.5px solid rgba(181,160,121,0.2)',
              boxShadow: '0 8px 32px rgba(181,160,121,0.15), 0 2px 8px rgba(107,79,75,0.1)',
              backdropFilter: 'blur(10px)',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: 'default',
              maxWidth: '800px',
              width: 'fit-content'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 12px 40px rgba(181,160,121,0.2), 0 4px 12px rgba(107,79,75,0.15)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 8px 32px rgba(181,160,121,0.15), 0 2px 8px rgba(107,79,75,0.1)';
            }}>
            {/* خلفية زخرفية */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '3px',
              background: 'linear-gradient(90deg, #e3cfa4, #b5a079, #e3cfa4)',
              borderRadius: '20px 20px 0 0'
            }}></div>
            
            <div className="summary-item" style={{ 
              textAlign: 'center',
              position: 'relative',
              zIndex: 1
            }}>
              <div style={{ 
                fontSize: '2rem', 
                fontWeight: 'bold', 
                color: '#b5a079',
                textShadow: '0 2px 4px rgba(181,160,121,0.2)',
                marginBottom: '0.5rem'
              }}>
                {subscriptions.length}
              </div>
              <div style={{ 
                fontSize: '0.95rem', 
                color: '#7d6a4d',
                fontWeight: '500'
              }}>Total Subscriptions</div>
            </div>
            
            <div className="summary-item" style={{ 
              textAlign: 'center',
              position: 'relative',
              zIndex: 1
            }}>
              <div style={{ 
                fontSize: '2rem', 
                fontWeight: 'bold', 
                color: '#b5a079',
                textShadow: '0 2px 4px rgba(181,160,121,0.2)',
                marginBottom: '0.5rem'
              }}>
                {formatCurrency(calculateTotalSubscriptions(), 'USD')}
              </div>
              <div style={{ 
                fontSize: '0.95rem', 
                color: '#7d6a4d',
                fontWeight: '500'
              }}>Total Amount</div>
            </div>
            
            <div className="summary-item" style={{ 
              textAlign: 'center',
              position: 'relative',
              zIndex: 1
            }}>
              <div style={{ 
                fontSize: '2rem', 
                fontWeight: 'bold', 
                color: '#b5a079',
                textShadow: '0 2px 4px rgba(181,160,121,0.2)',
                marginBottom: '0.5rem'
              }}>
                {subscriptions.filter(sub => sub?.status === 'active').length}
              </div>
              <div style={{ 
                fontSize: '0.95rem', 
                color: '#7d6a4d',
                fontWeight: '500'
              }}>Active Plans</div>
            </div>
            
            <div className="summary-item" style={{ 
              textAlign: 'center',
              position: 'relative',
              zIndex: 1
            }}>
              <div style={{ 
                fontSize: '2rem', 
                fontWeight: 'bold', 
                color: '#b5a079',
                textShadow: '0 2px 4px rgba(181,160,121,0.2)',
                marginBottom: '0.5rem'
              }}>
                {calculateTotalRemainingCourses()}
              </div>
              <div style={{ 
                fontSize: '0.95rem', 
                color: '#7d6a4d',
                fontWeight: '500'
              }}>Available Courses</div>
            </div>
          </div>
        </div>
        )}
      </div>

      {/* Show current subscription */}
      {activeSubscription && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          marginTop: '2rem',
          marginBottom: '2.5rem',
        }}>
          <div className="current-subscription-card" style={{
            maxWidth: '440px',
            width: '100%',
            background: 'linear-gradient(135deg, #f5f1eb 0%, #e3cfa4 100%)',
            borderRadius: '20px',
            boxShadow: '0 8px 32px #b5a07933',
            padding: '2.2rem 1.7rem',
            border: '2.5px solid #b5a079',
            position: 'relative',
            fontFamily: 'Tahoma, Arial, sans-serif',
          }}>
            <div style={{ position: 'absolute', top: 18, right: 18, fontSize: '2.2rem', color: '#b5a079' }}>⭐</div>
            <div className="subscription-card active">
              <div className="subscription-header" style={{ display: 'flex', alignItems: 'center', marginBottom: '1.2rem' }}>
                <div className="plan-info" style={{ flex: 1 }}>
                  <h2 style={{ margin: 0, color: '#7d6a4d', fontWeight: 800, fontSize: '1.45rem', letterSpacing: '0.5px' }}>Current Subscription</h2>
                  <div style={{ color: '#b5a079', fontSize: '1.08rem', marginTop: 4, fontWeight: 600 }}>{activeSubscription.plan_name}</div>
                </div>
                <div
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(activeSubscription?.status), color: '#fff', padding: '7px 20px', borderRadius: '14px', fontWeight: 'bold', fontSize: '1.05rem', marginLeft: 12, boxShadow: '0 2px 8px #b5a07933' }}
                >
                  {getStatusText(activeSubscription?.status)}
                </div>
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
                  <span className="detail-value" style={{ marginLeft: 8 }}>{activeSubscription.allowed_courses}</span>
                </div>
                <div className="detail-row" style={{ display: 'flex', alignItems: 'center' }}>
                  <span className="detail-label" style={{ fontWeight: 700, color: '#b5a079', minWidth: 120 }}>Remaining Courses:</span>
                  <span className="detail-value" style={{ marginLeft: 8 }}>{activeSubscription.remaining_courses !== undefined ? activeSubscription.remaining_courses : '-'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* جدول الاشتراكات السابقة */}
      {subscriptions && subscriptions.length > 0 && (
        <div style={{ marginTop: '2.5rem' }}>
          <h2 style={{ color: '#b5a079', fontWeight: 800, fontSize: '1.25rem', marginBottom: '1.2rem', textAlign: 'center', letterSpacing: '0.5px' }}>Subscription History</h2>
          <table className="subscriptions-table" style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 2px 12px #b5a07922', fontFamily: 'Tahoma, Arial, sans-serif' }}>
            <thead>
              <tr style={{ background: '#f5f1eb', color: '#b5a079', fontSize: '1.05rem' }}>
                <th style={{ padding: '12px 8px' }}>Plan</th>
                <th>Status</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Allowed Courses</th>
                <th>Remaining Courses</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.map((sub) => (
                <tr key={sub.id} style={{ borderBottom: '1px solid #e3cfa4', background: sub?.status === 'active' ? '#f0f9ff' : '#fff' }}>
                  <td style={{ padding: '10px 8px', fontWeight: 600 }}>{sub.plan_name}</td>
                  <td>
                    <span className="status-badge" style={{ backgroundColor: getStatusColor(sub?.status), color: '#fff', padding: '4px 12px', borderRadius: '8px', fontWeight: 'bold', letterSpacing: '0.5px' }}>
                      {getStatusText(sub?.status)}
                    </span>
                  </td>
                  <td>{formatDate(sub.start_date)}</td>
                  <td>{formatDate(sub.end_date)}</td>
                  <td>{sub.allowed_courses}</td>
                  <td>{sub.remaining_courses !== undefined ? sub.remaining_courses : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SubscriptionHistory; 