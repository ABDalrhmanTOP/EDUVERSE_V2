// src/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  FaSignOutAlt,
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye
} from 'react-icons/fa';
import axios from '../../api/axios';
import '../../styles/admin/AdminDashboard.css';
import eduverseLogo from '../../assets/eduverse_logo.png';

const AdminDashboard = () => {
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
        const testResponse = await axios.get('http://localhost:8000/api/user');
      } catch (testError) {
        // Backend connectivity test failed
      }

      // Set auth header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Fetch users, courses, and tasks
      const [usersRes, coursesRes, tasksRes] = await Promise.all([
        axios.get('/users'),
        axios.get('/courses'),
        axios.get('/tasks')
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
    { id: 'dashboard', label: 'Dashboard', icon: FaHome, path: '/AdminDashboard' },
    { id: 'courses', label: 'Courses', icon: FaBook, path: '/AdminDashboard/courses' },
    { id: 'tasks', label: 'Tasks', icon: FaTasks, path: '/AdminDashboard/tasks' },
    { id: 'edubot', label: 'EduBot', icon: FaRobot, path: '/AdminDashboard/edubot' },
    { id: 'users', label: 'Users', icon: FaUsers, path: '/AdminDashboard/users' },
    { id: 'analytics', label: 'Analytics', icon: FaChartBar, path: '/AdminDashboard/analytics' },
    { id: 'settings', label: 'Settings', icon: FaCog, path: '/AdminDashboard/settings' },
    { id: 'profile', label: 'Profile', icon: FaUserPlus, path: '/AdminDashboard/profile' }
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
          {loading ? <span className="stat-loading">...</span> : value}
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
            <h1 className="admin-welcome-title">Welcome to Admin Dashboard</h1>
            <p className="admin-welcome-subtitle">Manage your educational platform with ease</p>
          </div>
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
            {loading ? 'Refreshing...' : 'Refresh Stats'}
          </motion.button>
        </div>
      </motion.div>

      <div className="admin-stats-grid">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={FaUsers}
          color="#C89F9C"
          delay={0.1}
        />
        <StatCard
          title="Total Courses"
          value={stats.totalCourses}
          icon={FaBook}
          color="#A97C78"
          delay={0.2}
        />
        <StatCard
          title="Total Tasks"
          value={stats.totalTasks}
          icon={FaTasks}
          color="#8B7355"
          delay={0.3}
        />
        <StatCard
          title="Active Users"
          value={stats.activeUsers}
          icon={FaChartBar}
          color="#A0522D"
          delay={0.4}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="admin-quick-actions"
      >
        <h2 className="admin-section-title">Quick Actions</h2>
        <div className="admin-actions-grid">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="admin-action-btn"
            onClick={() => navigate('/AdminDashboard/courses')}
          >
            <FaPlus />
            <span>Add New Course</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="admin-action-btn"
            onClick={() => navigate('/AdminDashboard/users')}
          >
            <FaUsers />
            <span>Manage Users</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="admin-action-btn"
            onClick={() => navigate('/AdminDashboard/edubot')}
          >
            <FaRobot />
            <span>EduBot Settings</span>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );

  return (
    <div className="admin-dashboard-container">
      <div className="admin-sidebar">
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="admin-sidebar-header"
        >
          <div className="admin-logo">
            <img src={eduverseLogo} alt="EduVerse Logo" style={{ height: 36, marginRight: 10, borderRadius: 8 }} />
            <span>EduVerse Admin</span>
          </div>
        </motion.div>

        <nav className="admin-nav">
          {menuItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                to={item.path}
                className={`admin-nav-item ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => setActiveTab(item.id)}
              >
                <item.icon />
                <span>{item.label}</span>
              </Link>
            </motion.div>
          ))}
        </nav>

        <motion.button
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="admin-logout-btn"
          onClick={handleLogout}
        >
          <FaSignOutAlt />
          <span>Logout</span>
        </motion.button>
      </div>

      <div className="admin-main-content">
        <div className="admin-content-wrapper">
          {location.pathname === '/AdminDashboard' ? <DashboardContent /> : <Outlet />}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;