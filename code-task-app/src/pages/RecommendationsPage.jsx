import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaLightbulb, FaStar, FaPlayCircle, FaBook, FaArrowLeft, FaCrown, FaUnlock, FaLock, FaFilter } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from '../api/axios';
import '../styles/Dashboard.css';

const RecommendationsPage = () => {
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [progress, setProgress] = useState([]);
  const [recs, setRecs] = useState([]);
  const [freeRecs, setFreeRecs] = useState([]);
  const [paidRecs, setPaidRecs] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    type: 'all',
    year: '',
    semester: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch user data
        const userRes = await axios.get('/user');
        if (!userRes.data) {
          navigate('/');
          return;
        }
        setUser(userRes.data);

        // Fetch courses and progress
        const [coursesRes, progressRes] = await Promise.all([
          axios.get('/courses'),
          axios.get('/user-progress/all')
        ]);

        setCourses(coursesRes.data);
        setProgress(progressRes.data);

        // Fetch recommendations
        if (userRes.data.id) {
          try {
            const recsRes = await axios.get(`/recommendations/${userRes.data.id}`);
            setRecs(recsRes.data.recommendations || []);
            setFreeRecs(recsRes.data.free_recommendations || []);
            setPaidRecs(recsRes.data.paid_recommendations || []);
            setSubscription(recsRes.data.user_subscription || {});
          } catch (recsError) {
            console.error('Error fetching recommendations:', recsError);
            // Don't set error for recommendations, just show suggested courses
          }
        }

      } catch (err) {
        setError('Failed to load data');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  // Get suggested courses based on progress
  const getSuggestedCourses = () => {
    if (!courses || !progress) return [];
    
    const completedCourseIds = progress
      .filter(p => p.completed_tasks && p.completed_tasks.length > 0)
      .map(p => p.playlist_id);
    
    const suggestedCourses = courses.filter(course => 
      !completedCourseIds.includes(course.id)
    );
    
    return suggestedCourses.slice(0, 6); // Show more suggestions on dedicated page
  };

  const suggestedCourses = getSuggestedCourses();

  // Filter recommendations based on selected filters
  const getFilteredRecommendations = () => {
    let filtered = [...recs];
    
    if (filters.type === 'free') {
      filtered = freeRecs;
    } else if (filters.type === 'paid') {
      filtered = paidRecs;
    }
    
    if (filters.year) {
      filtered = filtered.filter(course => course.year == filters.year);
    }
    
    if (filters.semester) {
      filtered = filtered.filter(course => course.semester == filters.semester);
    }
    
    return filtered;
  };

  const filteredRecs = getFilteredRecommendations();

  const CourseCard = ({ course, isPaid = false }) => (
    <motion.div 
      whileHover={{ y: -8, scale: 1.02 }}
      style={{
        background: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 16,
        padding: 24,
        border: `2px solid ${isPaid ? '#e3cfa4' : '#bfae9e'}`,
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden'
      }}
      onClick={() => navigate(`/course/${course.id}`)}
    >
      {/* Paid badge */}
      {isPaid && (
        <div style={{
          position: 'absolute',
          top: 12,
          right: 12,
          background: 'linear-gradient(135deg, #e3cfa4 0%, #bfae9e 100%)',
          color: '#7d6a4d',
          padding: '4px 8px',
          borderRadius: 12,
          fontSize: 12,
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: 4
        }}>
          <FaCrown size={12} />
          {t('recommendations.course.premium')}
        </div>
      )}

      {/* Free badge */}
      {!isPaid && (
        <div style={{
          position: 'absolute',
          top: 12,
          right: 12,
          background: 'linear-gradient(135deg, #A7C7C5 0%, #7EC4CF 100%)',
          color: 'white',
          padding: '4px 8px',
          borderRadius: 12,
          fontSize: 12,
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: 4
        }}>
          <FaUnlock size={12} />
          {t('recommendations.course.free')}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        {isPaid ? (
          <FaCrown size={24} color="#e3cfa4" />
        ) : (
          <FaBook size={24} color="#bfae9e" />
        )}
        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#7d6a4d', flex: 1 }}>
          {course.name || `Course ${course.id}`}
        </h3>
      </div>

      {course.description && (
        <p style={{ 
          margin: '0 0 16px 0', 
          fontSize: 14, 
          color: '#b5a079', 
          lineHeight: 1.6,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {course.description}
        </p>
      )}

      {/* Course info */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: 12,
        color: '#b5a079'
      }}>
        <span>Year {course.year}, Semester {course.semester}</span>
        {course.confidence && (
          <span style={{
            background: 'rgba(191, 174, 158, 0.1)',
            padding: '2px 6px',
            borderRadius: 8,
            fontWeight: 600
          }}>
            {Math.round(course.confidence * 100)}% {t('recommendations.course.match')}
          </span>
        )}
      </div>

      {/* Subscription warning for paid courses */}
      {isPaid && subscription && !subscription.can_unlock_paid_courses && (
        <div style={{
          marginTop: 12,
          padding: 8,
          background: 'rgba(255, 193, 7, 0.1)',
          border: '1px solid rgba(255, 193, 7, 0.3)',
          borderRadius: 8,
          fontSize: 12,
          color: '#856404',
          display: 'flex',
          alignItems: 'center',
          gap: 6
        }}>
          <FaLock size={12} />
          {t('recommendations.course.subscriptionRequired')}
        </div>
      )}
    </motion.div>
  );

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #f5e9da 0%, #e8dcc0 40%, #f5f5f5 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            display: 'inline-block', 
            width: 50, 
            height: 50, 
            border: '4px solid #e8dcc0', 
            borderTop: '4px solid #bfae9e', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite',
            marginBottom: 20
          }}></div>
          <div style={{ color: '#7d6a4d', fontSize: 18, fontWeight: 600 }}>
            {t('recommendations.loading')}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #f5e9da 0%, #e8dcc0 40%, #f5f5f5 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <div style={{ 
            background: 'rgba(220, 53, 69, 0.1)', 
            border: '1px solid rgba(220, 53, 69, 0.2)', 
            borderRadius: 16, 
            padding: 32,
            color: '#dc3545'
          }}>
            <FaLightbulb size={32} style={{ marginBottom: 16 }} />
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
              {t('recommendations.error')}
            </div>
            <div style={{ fontSize: 14, opacity: 0.8, marginBottom: 20 }}>
              {error}
            </div>
            <button 
              onClick={() => navigate('/dashboard')}
              style={{
                background: '#bfae9e',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                padding: '12px 24px',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              {t('recommendations.goToDashboard')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f5e9da 0%, #e8dcc0 40%, #f5f5f5 100%)',
      padding: '80px 20px 40px 20px'
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 20, 
            marginBottom: 40,
            background: 'rgba(245, 241, 235, 0.95)',
            borderRadius: 20,
            padding: 24,
            boxShadow: '0 8px 32px rgba(191, 174, 158, 0.10)'
          }}
        >
          <button 
            onClick={() => navigate('/dashboard')}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#bfae9e',
              fontSize: 20
            }}
          >
            <FaArrowLeft />
          </button>
          <div>
            <h1 style={{ 
              margin: 0, 
              fontSize: 32, 
              fontWeight: 900, 
              color: '#7d6a4d',
              display: 'flex',
              alignItems: 'center',
              gap: 12
            }}>
              <FaLightbulb size={32} color="#bfae9e" />
              {t('recommendations.title')}
            </h1>
            <p style={{ 
              margin: '8px 0 0 0', 
              color: '#b5a079', 
              fontSize: 16,
              fontWeight: 500
            }}>
              {t('recommendations.subtitle')}
            </p>
          </div>
        </motion.div>

        {/* Subscription Status */}
        {subscription && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            style={{
              background: 'rgba(245, 241, 235, 0.95)',
              borderRadius: 16,
              padding: 20,
              marginBottom: 24,
              boxShadow: '0 8px 32px rgba(191, 174, 158, 0.10)',
              display: 'flex',
              alignItems: 'center',
              gap: 16
            }}
          >
            <FaCrown size={24} color="#bfae9e" />
            <div>
              <div style={{ fontWeight: 600, color: '#7d6a4d', marginBottom: 4 }}>
                {subscription.has_active_subscription ? t('recommendations.subscription.active') : t('recommendations.subscription.inactive')}
              </div>
              <div style={{ fontSize: 14, color: '#b5a079' }}>
                {subscription.has_active_subscription 
                  ? `${subscription.remaining_courses} ${t('recommendations.subscription.remainingCourses')}`
                  : t('recommendations.subscription.upgradeMessage')
                }
              </div>
            </div>
          </motion.div>
        )}

        {/* Filters */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          style={{
            background: 'rgba(245, 241, 235, 0.95)',
            borderRadius: 16,
            padding: 20,
            marginBottom: 24,
            boxShadow: '0 8px 32px rgba(191, 174, 158, 0.10)'
          }}
        >
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 12, 
            marginBottom: 16,
            color: '#7d6a4d',
            fontSize: 16,
            fontWeight: 600
          }}>
            <FaFilter size={16} />
            <span>{t('recommendations.filters.title')}</span>
          </div>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <select 
              value={filters.type}
              onChange={(e) => setFilters({...filters, type: e.target.value})}
              style={{
                padding: '8px 12px',
                borderRadius: 8,
                border: '1px solid #bfae9e',
                background: 'white',
                color: '#7d6a4d',
                fontSize: 14
              }}
            >
              <option value="all">{t('recommendations.filters.allCourses')}</option>
              <option value="free">{t('recommendations.filters.freeCourses')}</option>
              <option value="paid">{t('recommendations.filters.premiumCourses')}</option>
            </select>
            
            <select 
              value={filters.year}
              onChange={(e) => setFilters({...filters, year: e.target.value})}
              style={{
                padding: '8px 12px',
                borderRadius: 8,
                border: '1px solid #bfae9e',
                background: 'white',
                color: '#7d6a4d',
                fontSize: 14
              }}
            >
              <option value="">{t('recommendations.filters.allYears')}</option>
              <option value="1">{t('recommendations.filters.year1')}</option>
              <option value="2">{t('recommendations.filters.year2')}</option>
              <option value="3">{t('recommendations.filters.year3')}</option>
              <option value="4">{t('recommendations.filters.year4')}</option>
            </select>
            
            <select 
              value={filters.semester}
              onChange={(e) => setFilters({...filters, semester: e.target.value})}
              style={{
                padding: '8px 12px',
                borderRadius: 8,
                border: '1px solid #bfae9e',
                background: 'white',
                color: '#7d6a4d',
                fontSize: 14
              }}
            >
              <option value="">{t('recommendations.filters.allSemesters')}</option>
              <option value="1">{t('recommendations.filters.semester1')}</option>
              <option value="2">{t('recommendations.filters.semester2')}</option>
            </select>
          </div>
        </motion.div>

        {/* AI-Powered Recommendations */}
        {filteredRecs.length > 0 && (
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            style={{ 
              background: 'rgba(245, 241, 235, 0.95)',
              borderRadius: 24,
              padding: 32,
              marginBottom: 32,
              boxShadow: '0 8px 32px rgba(191, 174, 158, 0.10)'
            }}
          >
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 12, 
              marginBottom: 24,
              color: '#bfae9e',
              fontSize: 20,
              fontWeight: 700
            }}>
              <FaStar size={24} />
              <span>{t('recommendations.sections.aiPowered')} ({filteredRecs.length})</span>
            </div>
            <div style={{ 
              display: 'grid', 
              gap: 20, 
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))' 
            }}>
              {filteredRecs.map(course => (
                <CourseCard key={course.id} course={course} isPaid={course.paid} />
              ))}
            </div>
          </motion.section>
        )}

        {/* Free Courses Section */}
        {freeRecs.length > 0 && filters.type !== 'paid' && (
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            style={{ 
              background: 'rgba(245, 241, 235, 0.95)',
              borderRadius: 24,
              padding: 32,
              marginBottom: 32,
              boxShadow: '0 8px 32px rgba(191, 174, 158, 0.10)'
            }}
          >
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 12, 
              marginBottom: 24,
              color: '#A7C7C5',
              fontSize: 20,
              fontWeight: 700
            }}>
              <FaUnlock size={24} />
              <span>{t('recommendations.sections.freeCourses')} ({freeRecs.length})</span>
            </div>
            <div style={{ 
              display: 'grid', 
              gap: 20, 
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))' 
            }}>
              {freeRecs.map(course => (
                <CourseCard key={course.id} course={course} isPaid={false} />
              ))}
            </div>
          </motion.section>
        )}

        {/* Premium Courses Section */}
        {paidRecs.length > 0 && filters.type !== 'free' && (
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            style={{ 
              background: 'rgba(245, 241, 235, 0.95)',
              borderRadius: 24,
              padding: 32,
              marginBottom: 32,
              boxShadow: '0 8px 32px rgba(191, 174, 158, 0.10)'
            }}
          >
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 12, 
              marginBottom: 24,
              color: '#e3cfa4',
              fontSize: 20,
              fontWeight: 700
            }}>
              <FaCrown size={24} />
              <span>{t('recommendations.sections.premiumCourses')} ({paidRecs.length})</span>
            </div>
            <div style={{ 
              display: 'grid', 
              gap: 20, 
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))' 
            }}>
              {paidRecs.map(course => (
                <CourseCard key={course.id} course={course} isPaid={true} />
              ))}
            </div>
          </motion.section>
        )}

        {/* Suggested Courses */}
        {suggestedCourses.length > 0 && recs.length === 0 && (
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            style={{ 
              background: 'rgba(245, 241, 235, 0.95)',
              borderRadius: 24,
              padding: 32,
              marginBottom: 32,
              boxShadow: '0 8px 32px rgba(191, 174, 158, 0.10)'
            }}
          >
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 12, 
              marginBottom: 24,
              color: '#bfae9e',
              fontSize: 20,
              fontWeight: 700
            }}>
              <FaBook size={24} />
              <span>{t('recommendations.sections.suggestedCourses')} ({suggestedCourses.length})</span>
            </div>
            <div style={{ 
              display: 'grid', 
              gap: 20, 
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))' 
            }}>
              {suggestedCourses.map(course => (
                <CourseCard key={course.id} course={course} isPaid={false} />
              ))}
            </div>
          </motion.section>
        )}

        {/* No Recommendations */}
        {recs.length === 0 && suggestedCourses.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            style={{ 
              background: 'rgba(245, 241, 235, 0.95)',
              borderRadius: 24,
              padding: 48,
              textAlign: 'center',
              boxShadow: '0 8px 32px rgba(191, 174, 158, 0.10)'
            }}
          >
            <FaLightbulb size={48} style={{ marginBottom: 24, color: '#bfae9e' }} />
            <h2 style={{ 
              margin: '0 0 16px 0', 
              fontSize: 24, 
              fontWeight: 700, 
              color: '#7d6a4d' 
            }}>
              {t('recommendations.startJourney')}
            </h2>
            <p style={{ 
              margin: '0 0 24px 0', 
              fontSize: 16, 
              color: '#b5a079',
              maxWidth: 400,
              marginLeft: 'auto',
              marginRight: 'auto'
            }}>
              {t('recommendations.startJourneyDesc')}
            </p>
            <button 
              onClick={() => navigate('/homevideo')}
              style={{
                background: 'linear-gradient(135deg, #bfae9e 0%, #e3cfa4 100%)',
                color: 'white',
                border: 'none',
                borderRadius: 12,
                padding: '16px 32px',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: 16,
                boxShadow: '0 4px 16px rgba(191, 174, 158, 0.3)'
              }}
            >
              {t('recommendations.exploreCourses')}
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default RecommendationsPage; 