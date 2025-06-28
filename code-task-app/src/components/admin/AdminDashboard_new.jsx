import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  FaHome,
  FaBook,
  FaTasks,
  FaUsers,
  FaChartBar,
  FaCog,
  FaUserPlus,
  FaRobot,
  FaSync,
  FaPlus,
  FaSignOutAlt
} from 'react-icons/fa';
import apiClient from '../../api/axios';
import LanguageSwitcher from './LanguageSwitcher';
import '../../styles/admin/AdminDashboard.css';
import eduverseLogo from '../../assets/eduverse_logo.png';

const AdminDashboard = () => {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalTasks: 0,
    activeUsers: 0
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Function to format numbers in Arabic
  const formatNumber = (num) => {
    if (i18n.language === 'ar') {
      return num.toLocaleString('ar-EG');
    }
    return num.toLocaleString();
  };

  // Function to get EduBot text based on language
  const getEduBotText = () => {
    return i18n.language === 'ar' ? 'Edubot إعدادات' : 'EduBot Settings';
  };

  useEffect(() => {
    fetchStats();
    // Set active tab based on current location
    const path = location.pathname;
    if (path.includes('/courses')) setActiveTab('courses');
    else if (path.includes('/users')) setActiveTab('users');
    else if (path.includes('/edubot')) setActiveTab('edubot');
    else if (path.includes('/tasks')) setActiveTab('tasks');
    else if (path.includes('/analytics')) setActiveTab('analytics');
    else if (path.includes('/settings')) setActiveTab('settings');
    else if (path.includes('/profile')) setActiveTab('profile');
    else setActiveTab('dashboard');
  }, [location.pathname]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // Parse and check user data
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        if (user.role !== 'admin') {
          alert('You need admin privileges to access this dashboard.');
          return;
        }
      }
      
      // Check if we have authentication
      const token = localStorage.getItem('token');
      if (!token) {
        setStats({
          totalUsers: 0,
          totalCourses: 0,
          totalTasks: 0,
          activeUsers: 0
        });
        return;
      }

      // Test if backend is reachable
      try {
        const testResponse = await apiClient.get('/user');
      } catch (testError) {
        // Backend connectivity test failed
      }

      // Set auth header
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Fetch users, courses, and tasks
      const [usersRes, coursesRes, tasksRes] = await Promise.all([
        apiClient.get('/admin/users'),
        apiClient.get('/admin/courses'),
        apiClient.get('/admin/tasks')
      ]);

      const newStats = {
        totalUsers: usersRes.data?.length || 0,
        totalCourses: coursesRes.data?.length || 0,
        totalTasks: tasksRes.data?.length || 0,
        activeUsers: usersRes.data?.filter(user => user.email_verified_at)?.length || 0
      };

      setStats(newStats);
    } catch (error) {
      // Set default values if API fails
      setStats({
        totalUsers: 0,
        totalCourses: 0,
        totalTasks: 0,
        activeUsers: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const menuItems = [
    { id: 'dashboard', label: t('admin.navigation.dashboard'), icon: FaHome, path: '/AdminDashboard' },
    { id: 'courses', label: t('admin.navigation.courses'), icon: FaBook, path: '/AdminDashboard/courses' },
    { id: 'tasks', label: t('admin.navigation.tasks'), icon: FaTasks, path: '/AdminDashboard/tasks' },
    { id: 'edubot', label: getEduBotText(), icon: FaRobot, path: '/AdminDashboard/edubot' },
    { id: 'users', label: t('admin.navigation.users'), icon: FaUsers, path: '/AdminDashboard/users' },
    { id: 'analytics', label: t('admin.navigation.reports'), icon: FaChartBar, path: '/AdminDashboard/analytics' },
    { id: 'settings', label: t('admin.navigation.settings'), icon: FaCog, path: '/AdminDashboard/settings' },
    { id: 'profile', label: t('admin.navigation.profile'), icon: FaUserPlus, path: '/AdminDashboard/profile' }
  ];

  const StatCard = ({ title, value, icon: Icon, color, delay }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="admin-stat-card"
      style={{ '--card-color': color }}
    >
      <div className="admin-stat-icon">
        <Icon />
      </div>
      <div className="admin-stat-content">
        <h3 className="admin-stat-value">
          {loading ? <span className="stat-loading">...</span> : formatNumber(value)}
        </h3>
        <p className="admin-stat-title">{title}</p>
      </div>
    </motion.div>
  );

  const DashboardContent = () => (
    <div className="admin-dashboard-content">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="admin-welcome-section"
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h1 className="admin-welcome-title">{t('admin.dashboard.welcome')}</h1>
            <p className="admin-welcome-subtitle">{t('admin.dashboard.subtitle')}</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <LanguageSwitcher />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchStats}
              disabled={loading}
              style={{
                background: 'linear-gradient(135deg, #C89F9C 0%, #A97C78 100%)',
                color: '#4A3F3F',
                border: 'none',
                borderRadius: '12px',
                padding: '0.75rem 1.5rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <FaSync className={loading ? 'spinning' : ''} />
              {loading ? t('admin.dashboard.refreshing') : t('admin.dashboard.refreshStats')}
            </motion.button>
          </div>
        </div>
      </motion.div>

      <div className="admin-stats-grid">
        <StatCard
          title={t('admin.dashboard.totalUsers')}
          value={stats.totalUsers}
          icon={FaUsers}
          color="#C89F9C"
          delay={0.1}
        />
        <StatCard
          title={t('admin.dashboard.totalCourses')}
          value={stats.totalCourses}
          icon={FaBook}
          color="#A97C78"
          delay={0.2}
        />
        <StatCard
          title={t('admin.dashboard.totalTasks')}
          value={stats.totalTasks}
          icon={FaTasks}
          color="#8B6B6B"
          delay={0.3}
        />
        <StatCard
          title={t('admin.dashboard.activeUsers')}
          value={stats.activeUsers}
          icon={FaUserPlus}
          color="#6B4F4F"
          delay={0.4}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="admin-quick-actions"
      >
        <h2 className="admin-section-title">{t('admin.dashboard.quickActions')}</h2>
        <div className="admin-actions-grid">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="admin-action-btn"
            onClick={() => navigate('/AdminDashboard/courses')}
          >
            <FaPlus />
            <span>{t('admin.courses.addCourse')}</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="admin-action-btn"
            onClick={() => navigate('/AdminDashboard/users')}
          >
            <FaUsers />
            <span>{t('admin.users.title')}</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="admin-action-btn"
            onClick={() => navigate('/AdminDashboard/edubot')}
          >
            <FaRobot />
            <span>{getEduBotText()}</span>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        className="admin-sidebar"
      >
        <div className="admin-sidebar-header">
          <img src={eduverseLogo} alt="EduVerse Logo" className="admin-logo" style={{ height: '36px', width: 'auto' }} />
          <h2>EduVerse Admin</h2>
        </div>

        <nav className="admin-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.id}
                to={item.path}
                className={`admin-nav-item ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => setActiveTab(item.id)}
              >
                <Icon />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="admin-sidebar-footer">
          <button onClick={handleLogout} className="admin-logout-btn">
            <FaSignOutAlt />
            <span>{t('admin.navigation.logout')}</span>
          </button>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="admin-main-content">
        {location.pathname === '/AdminDashboard' ? <DashboardContent /> : <Outlet />}
      </div>
    </div>
  );
};

export default AdminDashboard; 