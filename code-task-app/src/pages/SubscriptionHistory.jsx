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

  // حساب مجموع الاشتراكات
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
      if (subscription.status === 'active') {
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
        if (subscription.status === 'active') {
        
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
        if (subscription.status === 'active') {
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
        if (subscription.status === 'active') {
          totalActive += 1;
        }
      });
    }
    
    return totalActive;
  };

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
                {subscriptions.filter(sub => sub.status === 'active').length}
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
      {currentSubscription && currentSubscription.has_active_subscription && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          marginTop: '2rem'
        }}>
          <div className="current-subscription-card" style={{
            maxWidth: '420px',
            width: '100%'
          }}>
            
          <div className="subscription-card active">
            <div className="subscription-header">
              <div className="plan-info">
              <h2>Current Subscription</h2>
              </div>
              <div 
                className="status-badge"
                style={{ backgroundColor: getStatusColor(currentSubscription.subscription.status) }}
              >
                Active
              </div>
            </div>

            <div className="subscription-details">
             
              
              <div className="detail-row">
                <span className="detail-label">Total Subscriptions:</span>
                <span className="detail-value" style={{ 
                  color: '#b5a079', 
                  fontWeight: 'bold',
                  fontSize: '1.05rem'
                }}>
                  {formatCurrency(calculateTotalSubscriptions(), currentSubscription.subscription.currency)}
                </span>
              </div>
              
              <div className="detail-row">
                <span className="detail-label">Active Subscriptions:</span>
                <span className="detail-value" style={{ 
                  color: '#b5a079', 
                  fontWeight: 'bold',
                  fontSize: '1.05rem'
                }}>
                  {formatCurrency(calculateActiveSubscriptionsTotal(), currentSubscription.subscription.currency)}
                </span>
              </div>
              
              <div className="detail-row">
                <span className="detail-label">Start Date:</span>
                <span className="detail-value">
                  {formatDate(currentSubscription.subscription.start_date)}
                </span>
              </div>

              <div className="detail-row">
                <span className="detail-label">End Date:</span>
                <span className="detail-value">
                  {formatDate(currentSubscription.subscription.end_date)}
                </span>
              </div>

              <div className="detail-row">
                <span className="detail-label">Total Courses Used:</span>
                <span className="detail-value" style={{ 
                  color: '#b5a079', 
                  fontWeight: 'bold',
                  fontSize: '1.05rem'
                }}>
                   {calculateTotalUsedCourses()} of {calculateTotalActiveSubscriptions()}
                </span>
              </div>

              <div className="detail-row">
                <span className="detail-label">Available Courses:</span>
                <span className="detail-value" style={{ 
                  color: calculateTotalRemainingCourses() > 0 ? '#b5a079' : '#ef4444',
                  fontWeight: 'bold',
                  fontSize: '1.15rem',
                  textShadow: calculateTotalRemainingCourses() > 0 ? '0 1px 2px rgba(181,160,121,0.2)' : 'none'
                }}>
                  {calculateTotalRemainingCourses()} courses available
                </span>
              </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {subscriptions.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>No Subscriptions</h3>
          <p>You have not subscribed yet. Start your learning journey now!</p>
          <button 
            className="subscribe-now-btn"
            onClick={() => window.location.href = '/subscription-plans'}
          >
            Subscribe Now
          </button>
        </div>
      ) : (
        <div className="subscriptions-section" style={{
          maxWidth: '1000px',
          margin: '0 auto',
          padding: '0 2rem'
        }}>
          <div style={{
            textAlign: 'center',
            marginBottom: '2rem'
          }}>
            <h2 style={{
              fontSize: '2rem',
              color: '#b5a079',
              fontWeight: '700',
              marginBottom: '0.5rem'
            }}>Previous Subscriptions</h2>
            <p style={{
              fontSize: '1.1rem',
              color: '#7d6a4d',
              maxWidth: '600px',
              margin: '0 auto'
            }}>Browse through your subscription history</p>
          </div>
          
          <div className="scroll-controls">
            <button 
              type="button"
              className="scroll-btn left-btn" 
              onClick={() => {
                console.log('Left button clicked');
                scrollLeft();
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'linear-gradient(135deg, #f5f1eb 0%, #e3cfa4 50%, #b5a079 100%)';
                e.target.style.transform = 'translateY(-50%) scale(1.1)';
                e.target.style.boxShadow = '0 8px 25px rgba(181,160,121,0.6), 0 4px 12px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'linear-gradient(135deg, #e3cfa4 0%, #b5a079 50%, #8b7355 100%)';
                e.target.style.transform = 'translateY(-50%) scale(1)';
                e.target.style.boxShadow = '0 4px 15px rgba(181,160,121,0.4), 0 2px 8px rgba(0,0,0,0.1)';
              }}
              style={{ 
                position: 'absolute', 
                left: '10px', 
                top: '50%', 
                transform: 'translateY(-50%)',
                zIndex: 100,
                background: 'linear-gradient(135deg, #e3cfa4 0%, #b5a079 50%, #8b7355 100%)',
                color: 'white',
                border: '2px solid rgba(255,255,255,0.3)',
                borderRadius: '50%',
                width: '55px',
                height: '55px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem',
                fontWeight: 'bold',
                boxShadow: '0 4px 15px rgba(181,160,121,0.4), 0 2px 8px rgba(0,0,0,0.1)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <FaChevronLeft />
            </button>
            <button 
              type="button"
              className="scroll-btn right-btn" 
              onClick={() => {
                console.log('Right button clicked');
                scrollRight();
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'linear-gradient(135deg, #f5f1eb 0%, #e3cfa4 50%, #b5a079 100%)';
                e.target.style.transform = 'translateY(-50%) scale(1.1)';
                e.target.style.boxShadow = '0 8px 25px rgba(181,160,121,0.6), 0 4px 12px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'linear-gradient(135deg, #e3cfa4 0%, #b5a079 50%, #8b7355 100%)';
                e.target.style.transform = 'translateY(-50%) scale(1)';
                e.target.style.boxShadow = '0 4px 15px rgba(181,160,121,0.4), 0 2px 8px rgba(0,0,0,0.1)';
              }}
              style={{ 
                position: 'absolute', 
                right: '10px', 
                top: '50%', 
                transform: 'translateY(-50%)',
                zIndex: 100,
                background: 'linear-gradient(135deg, #e3cfa4 0%, #b5a079 50%, #8b7355 100%)',
                color: 'white',
                border: '2px solid rgba(255,255,255,0.3)',
                borderRadius: '50%',
                width: '55px',
                height: '55px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem',
                fontWeight: 'bold',
                boxShadow: '0 4px 15px rgba(181,160,121,0.4), 0 2px 8px rgba(0,0,0,0.1)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <FaChevronRight />
            </button>
          </div>
          
          <div 
            className="subscriptions-scroll-container"
            ref={scrollContainerRef}
            onScroll={checkScrollButtons}
            style={{ margin: '0 70px' }}
          >
          {subscriptions.map((subscription) => (
            <div key={subscription.id} className="subscription-card">
              <div className="subscription-header">
                <div className="plan-info">
                  <h3>{subscription.plan_name}</h3>
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
                  <span className="detail-label">Amount:</span>
                  <span className="detail-value">
                    {formatCurrency(subscription.amount, subscription.currency)}
                  </span>
                </div>
                
                <div className="detail-row">
                  <span className="detail-label">Start Date:</span>
                  <span className="detail-value">
                    {formatDate(subscription.start_date)}
                  </span>
                </div>

                <div className="detail-row">
                  <span className="detail-label">End Date:</span>
                  <span className="detail-value">
                    {formatDate(subscription.end_date)}
                  </span>
                </div>

                {subscription.transaction_id && (
                  <div className="detail-row">
                    <span className="detail-label">Transaction ID:</span>
                    <span className="detail-value transaction-id">
                      {subscription.transaction_id}
                    </span>
                  </div>
                )}
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