import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Users, 
  MessageCircle, 
  Trophy, 
  Calendar,
  TrendingUp,
  Star,
  Target,
  Play,
  Clock,
  Award,
  BarChart3,
  Activity,
  Zap,
  CheckCircle,
  Video,
  Book,
  Headphones,
  Code,
  Palette
} from 'lucide-react';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated || !user) {
    return null;
  }

  const username = user.username || user.name || 'User';
  const userLevel = user.level || 1;
  const userPoints = user.points || 0;
  const completedCourses = user.completed_courses || 0;
  const currentCourses = user.current_courses || 0;

  const quickActions = [
    {
      id: 1,
      title: 'EduBot Chat',
      description: 'Get instant help and answers from our AI tutor',
      icon: MessageCircle,
      color: '#667eea',
      route: '/chat'
    },
    {
      id: 2,
      title: 'Community',
      description: 'Connect with learners and share knowledge',
      icon: Users,
      color: '#f093fb',
      route: '/community'
    },
    {
      id: 3,
      title: 'Courses',
      description: 'Explore new courses and continue learning',
      icon: BookOpen,
      color: '#4facfe',
      route: '/homevideo'
    },
    {
      id: 4,
      title: 'Schedule',
      description: 'View your learning schedule and deadlines',
      icon: Calendar,
      color: '#43e97b',
      route: '/schedule'
    }
  ];

  const currentCoursesData = [
    {
      id: 1,
      title: 'Advanced React.js',
      instructor: 'Dr. Sarah Ahmed',
      progress: 75,
      thumbnail: 'https://via.placeholder.com/80x60/4facfe/ffffff?text=React',
      lastLesson: 'Advanced Hooks',
      nextLesson: 'Context API'
    },
    {
      id: 2,
      title: 'Node.js Backend',
      instructor: 'Dr. Mohamed Ali',
      progress: 45,
      thumbnail: 'https://via.placeholder.com/80x60/43e97b/ffffff?text=Node',
      lastLesson: 'Express.js Basics',
      nextLesson: 'Database Integration'
    },
    {
      id: 3,
      title: 'UI/UX Design',
      instructor: 'Dr. Fatima Hassan',
      progress: 30,
      thumbnail: 'https://via.placeholder.com/80x60/f093fb/ffffff?text=UI/UX',
      lastLesson: 'Design Principles',
      nextLesson: 'Design Tools'
    }
  ];

  const recentActivity = [
    {
      id: 1,
      type: 'course_completed',
      title: 'Completed JavaScript Fundamentals course',
      time: '2 hours ago',
      icon: CheckCircle,
      color: '#43e97b'
    },
    {
      id: 2,
      type: 'achievement',
      title: 'Earned "Active Learner" badge',
      time: '4 hours ago',
      icon: Award,
      color: '#ffd700'
    },
    {
      id: 3,
      type: 'lesson_watched',
      title: 'Watched React Hooks lesson',
      time: '6 hours ago',
      icon: Video,
      color: '#4facfe'
    },
    {
      id: 4,
      type: 'community_post',
      title: 'Posted in React community',
      time: '1 day ago',
      icon: Users,
      color: '#f093fb'
    }
  ];

  const learningStats = [
    { label: 'Study Hours Today', value: '3.5', icon: Clock, color: '#4facfe' },
    { label: 'Lessons Completed', value: '12', icon: CheckCircle, color: '#43e97b' },
    { label: 'Points Earned', value: '150', icon: Star, color: '#ffd700' },
    { label: 'Streak Days', value: '12', icon: Zap, color: '#f093fb' }
  ];

  const handleQuickAction = (route) => {
    navigate(route);
  };

  return (
    <div className="dashboard-container">
      {/* Header Section */}
      <motion.section 
        className="dashboard-header"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="header-content">
          <div className="welcome-section">
            <h1 className="welcome-title">
              Welcome back, <span className="username">{username}</span>!
            </h1>
            <p className="welcome-subtitle">
            Ready to continue your learning journey?
        </p>
          </div>
          <div className="time-display">
            <span className="time-text">
              {currentTime.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                second: '2-digit'
              })}
            </span>
          </div>
        </div>
      </motion.section>

      {/* User Stats */}
      <motion.section 
        className="user-stats-section"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.8 }}
      >
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">🎯</div>
            <div className="stat-info">
              <span className="stat-value">{userLevel}</span>
              <span className="stat-label">Level</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⭐</div>
            <div className="stat-info">
              <span className="stat-value">{userPoints}</span>
              <span className="stat-label">Points</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📚</div>
            <div className="stat-info">
              <span className="stat-value">{completedCourses}</span>
              <span className="stat-label">Completed</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🔄</div>
            <div className="stat-info">
              <span className="stat-value">{currentCourses}</span>
              <span className="stat-label">In Progress</span>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Learning Stats */}
      <motion.section 
        className="learning-stats-section"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.8 }}
      >
        <h2 className="section-title">Today's Learning Progress</h2>
        <div className="learning-stats-grid">
          {learningStats.map((stat, index) => (
            <motion.div
              key={index}
              className="learning-stat-card"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 + index * 0.1, duration: 0.6 }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="stat-icon-wrapper" style={{ background: stat.color }}>
                <stat.icon size={24} color="white" />
              </div>
              <div className="stat-content">
                <h3 className="stat-number">{stat.value}</h3>
                <p className="stat-label">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Quick Actions */}
      <motion.section 
        className="quick-actions-section"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.8 }}
      >
        <h2 className="section-title">Quick Access</h2>
        <div className="quick-actions-grid">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.id}
              className="quick-action-card"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + index * 0.1, duration: 0.6 }}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleQuickAction(action.route)}
            >
              <div className="card-icon" style={{ background: action.color }}>
                <action.icon size={32} color="white" />
              </div>
              <div className="card-content">
                <h3 className="card-title">{action.title}</h3>
                <p className="card-description">{action.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Current Courses */}
      <motion.section 
        className="current-courses-section"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.8 }}
      >
        <h2 className="section-title">My Current Courses</h2>
        <div className="courses-grid">
          {currentCoursesData.map((course, index) => (
            <motion.div
              key={course.id}
              className="course-card"
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.0 + index * 0.1, duration: 0.6 }}
              whileHover={{ scale: 1.02, y: -5 }}
            >
              <div className="course-header">
                <img src={course.thumbnail} alt={course.title} className="course-thumbnail" />
                <div className="course-info">
                  <h3 className="course-title">{course.title}</h3>
                  <p className="course-instructor">{course.instructor}</p>
                </div>
              </div>
              <div className="course-progress">
                <div className="progress-info">
                  <span>Progress</span>
                  <span>{course.progress}%</span>
                </div>
                <div className="progress-bar">
                  <motion.div 
                    className="progress-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${course.progress}%` }}
                    transition={{ delay: 1.2 + index * 0.1, duration: 1 }}
                  />
                </div>
              </div>
              <div className="course-details">
                <div className="detail-item">
                  <span className="detail-label">Last lesson:</span>
                  <span className="detail-value">{course.lastLesson}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Next lesson:</span>
                  <span className="detail-value">{course.nextLesson}</span>
                </div>
              </div>
              <motion.button 
                className="continue-button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/homevideo')}
              >
                <Play size={16} />
                Continue Learning
              </motion.button>
            </motion.div>
          ))}
      </div>
      </motion.section>

      {/* Recent Activity */}
      <motion.section 
        className="recent-activity-section"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0, duration: 0.8 }}
      >
        <h2 className="section-title">Recent Activity</h2>
        <div className="activity-list">
          {recentActivity.map((activity, index) => (
            <motion.div
              key={activity.id}
              className="activity-item"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.2 + index * 0.1, duration: 0.6 }}
              whileHover={{ x: 10 }}
            >
              <div className="activity-icon" style={{ background: activity.color }}>
                <activity.icon size={20} color="white" />
              </div>
              <div className="activity-content">
                <h4 className="activity-title">{activity.title}</h4>
                <p className="activity-time">{activity.time}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>
    </div>
  );
};

export default Dashboard;