import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaLightbulb, FaStar, FaBook, FaArrowRight, FaCrown, FaUnlock, FaLock, FaTrophy, FaGraduationCap, FaRocket } from 'react-icons/fa';
import axios from '../api/axios';
import '../styles/Dashboard.css';

const CourseCompletionRecommendations = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { courseId } = useParams();
  const location = useLocation();
  
  // Get data from navigation state or use defaults
  const {
    completedCourseId = courseId,
    completedCourseName = "Course",
    userScore = 0,
    maxScore = 10,
    grade = "N/A"
  } = location.state || {};

  const [user, setUser] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [freeRecs, setFreeRecs] = useState([]);
  const [paidRecs, setPaidRecs] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCelebration, setShowCelebration] = useState(true);

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

        // Fetch recommendations
        if (userRes.data.id) {
          try {
            const recsRes = await axios.get(`/recommendations/${userRes.data.id}`);
            setRecommendations(recsRes.data.recommendations || []);
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

  const getScorePercentage = () => {
    return Math.round((userScore / maxScore) * 100);
  };

  const getScoreColor = () => {
    const percentage = getScorePercentage();
    if (percentage >= 90) return '#28a745'; // Green
    if (percentage >= 80) return '#17a2b8'; // Blue
    if (percentage >= 70) return '#ffc107'; // Yellow
    if (percentage >= 60) return '#fd7e14'; // Orange
    return '#dc3545'; // Red
  };

  const getGradeColor = (grade) => {
    switch (grade?.toUpperCase()) {
      case 'A': return '#28a745';
      case 'B': return '#17a2b8';
      case 'C': return '#ffc107';
      case 'D': return '#fd7e14';
      case 'F': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const CourseCard = ({ course, isPaid = false }) => (
    <motion.div 
      whileHover={{ y: -8, scale: 1.02 }}
      style={{
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 16,
        padding: 24,
        border: `2px solid ${isPaid ? '#e3cfa4' : '#bfae9e'}`,
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(191, 174, 158, 0.15)'
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

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f5e9da 0%, #e8dcc0 40%, #f5f5f5 100%)',
      padding: '40px 20px'
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        
        {/* Celebration Section */}
        {showCelebration && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, type: 'spring' }}
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: 24,
              padding: 40,
              marginBottom: 40,
              textAlign: 'center',
              boxShadow: '0 16px 48px rgba(191, 174, 158, 0.20)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Celebration Background */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 193, 7, 0.1) 100%)',
              zIndex: 0
            }}></div>
            
            <div style={{ position: 'relative', zIndex: 1 }}>
              {/* Trophy Icon */}
              <motion.div
                initial={{ y: -50, rotate: -10 }}
                animate={{ y: 0, rotate: 0 }}
                transition={{ delay: 0.3, duration: 0.8, type: 'spring' }}
                style={{ marginBottom: 24 }}
              >
                <FaTrophy size={64} color="#ffd700" />
              </motion.div>

              {/* Congratulations Text */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                style={{ 
                  fontSize: 36, 
                  fontWeight: 900, 
                  color: '#7d6a4d',
                  margin: '0 0 16px 0'
                }}
              >
                🎉 {t('courseCompletion.congratulations')} 🎉
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.6 }}
                style={{ 
                  fontSize: 20, 
                  color: '#b5a079', 
                  margin: '0 0 24px 0',
                  fontWeight: 600
                }}
              >
                {t('courseCompletion.completedSuccessfully')}
              </motion.p>

              {/* Course Name */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.9, duration: 0.6 }}
                style={{
                  background: 'linear-gradient(135deg, #bfae9e 0%, #e3cfa4 100%)',
                  borderRadius: 16,
                  padding: '16px 24px',
                  margin: '0 auto 24px auto',
                  maxWidth: 400,
                  color: 'white',
                  fontWeight: 700,
                  fontSize: 18
                }}
              >
                {completedCourseName || t('courseCompletion.course')}
              </motion.div>

              {/* Score Display */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1, duration: 0.6 }}
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 24,
                  marginBottom: 32
                }}
              >
                <div style={{
                  background: 'rgba(255, 255, 255, 0.9)',
                  borderRadius: 16,
                  padding: '20px 24px',
                  border: `3px solid ${getScoreColor()}`,
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: 14, color: '#b5a079', marginBottom: 8 }}>
                    {t('courseCompletion.finalScore')}
                  </div>
                  <div style={{ 
                    fontSize: 32, 
                    fontWeight: 900, 
                    color: getScoreColor(),
                    marginBottom: 4
                  }}>
                    {userScore}/{maxScore}
                  </div>
                  <div style={{ 
                    fontSize: 16, 
                    fontWeight: 600, 
                    color: getScoreColor()
                  }}>
                    {getScorePercentage()}%
                  </div>
                </div>

                {grade && (
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: 16,
                    padding: '20px 24px',
                    border: `3px solid ${getGradeColor(grade)}`,
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: 14, color: '#b5a079', marginBottom: 8 }}>
                      {t('courseCompletion.grade')}
                    </div>
                    <div style={{ 
                      fontSize: 32, 
                      fontWeight: 900, 
                      color: getGradeColor(grade)
                    }}>
                      {grade}
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Next Steps */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3, duration: 0.6 }}
                style={{
                  background: 'rgba(191, 174, 158, 0.1)',
                  borderRadius: 16,
                  padding: 24,
                  marginBottom: 24
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 12, 
                  marginBottom: 12,
                  color: '#7d6a4d',
                  fontSize: 18,
                  fontWeight: 700
                }}>
                  <FaRocket size={20} color="#bfae9e" />
                  <span>{t('courseCompletion.nextSteps')}</span>
                </div>
                <p style={{ 
                  margin: 0, 
                  color: '#b5a079', 
                  fontSize: 16,
                  lineHeight: 1.6
                }}>
                  {t('courseCompletion.nextStepsDesc')}
                </p>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5, duration: 0.6 }}
                style={{
                  display: 'flex',
                  gap: 16,
                  justifyContent: 'center',
                  flexWrap: 'wrap'
                }}
              >
                <button 
                  onClick={() => setShowCelebration(false)}
                  style={{
                    background: 'linear-gradient(135deg, #bfae9e 0%, #e3cfa4 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 12,
                    padding: '16px 32px',
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontSize: 16,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    boxShadow: '0 4px 16px rgba(191, 174, 158, 0.3)'
                  }}
                >
                  <FaLightbulb size={16} />
                  {t('courseCompletion.viewRecommendations')}
                </button>
                
                <button 
                  onClick={() => navigate('/homevideo')}
                  style={{
                    background: 'rgba(255, 255, 255, 0.9)',
                    color: '#7d6a4d',
                    border: '2px solid #bfae9e',
                    borderRadius: 12,
                    padding: '16px 32px',
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontSize: 16,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                  }}
                >
                  <FaBook size={16} />
                  {t('courseCompletion.exploreMoreCourses')}
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Recommendations Section */}
        {!showCelebration && (
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Header */}
            <motion.div 
              style={{ 
                background: 'rgba(255, 255, 255, 0.95)',
                borderRadius: 20,
                padding: 32,
                marginBottom: 32,
                boxShadow: '0 8px 32px rgba(191, 174, 158, 0.15)'
              }}
            >
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 16,
                marginBottom: 16
              }}>
                <button 
                  onClick={() => setShowCelebration(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#bfae9e',
                    fontSize: 20
                  }}
                >
                  ←
                </button>
                <div>
                  <h1 style={{ 
                    margin: 0, 
                    fontSize: 28, 
                    fontWeight: 900, 
                    color: '#7d6a4d',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12
                  }}>
                    <FaLightbulb size={28} color="#bfae9e" />
                    {t('courseCompletion.personalizedRecommendations')}
                  </h1>
                  <p style={{ 
                    margin: '8px 0 0 0', 
                    color: '#b5a079', 
                    fontSize: 16,
                    fontWeight: 500
                  }}>
                    {t('courseCompletion.basedOnCompletion')}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Free Courses */}
            {freeRecs.length > 0 && (
              <motion.section 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                style={{ 
                  background: 'rgba(255, 255, 255, 0.95)',
                  borderRadius: 24,
                  padding: 32,
                  marginBottom: 32,
                  boxShadow: '0 8px 32px rgba(191, 174, 158, 0.15)'
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

            {/* Premium Courses */}
            {paidRecs.length > 0 && (
              <motion.section 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                style={{ 
                  background: 'rgba(255, 255, 255, 0.95)',
                  borderRadius: 24,
                  padding: 32,
                  marginBottom: 32,
                  boxShadow: '0 8px 32px rgba(191, 174, 158, 0.15)'
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

            {/* No Recommendations */}
            {recommendations.length === 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                style={{ 
                  background: 'rgba(255, 255, 255, 0.95)',
                  borderRadius: 24,
                  padding: 48,
                  textAlign: 'center',
                  boxShadow: '0 8px 32px rgba(191, 174, 158, 0.15)'
                }}
              >
                <FaLightbulb size={48} style={{ marginBottom: 24, color: '#bfae9e' }} />
                <h2 style={{ 
                  margin: '0 0 16px 0', 
                  fontSize: 24, 
                  fontWeight: 700, 
                  color: '#7d6a4d' 
                }}>
                  {t('courseCompletion.keepLearning')}
                </h2>
                <p style={{ 
                  margin: '0 0 24px 0', 
                  fontSize: 16, 
                  color: '#b5a079',
                  maxWidth: 400,
                  marginLeft: 'auto',
                  marginRight: 'auto'
                }}>
                  {t('courseCompletion.keepLearningDesc')}
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
                  {t('courseCompletion.exploreMoreCourses')}
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CourseCompletionRecommendations; 