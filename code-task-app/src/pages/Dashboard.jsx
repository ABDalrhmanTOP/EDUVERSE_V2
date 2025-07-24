import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBook, FaMedal, FaFire, FaChartLine, FaPlayCircle, FaUserCircle, FaRegImage } from 'react-icons/fa';
import axios from '../api/axios';
import '../styles/Dashboard.css';
import { useNavigate } from 'react-router-dom';

const THEME = {
  primary: '#bfae9e',
  primaryDark: '#a68a6d',
  accentGreen: '#43e97b',
  accentBlue: '#4facfe',
  accentYellow: '#ffd700',
  accentPink: '#f093fb',
  text: '#2c2218',
  subtext: '#7a6a6a',
  cardBg: 'rgba(255,255,255,0.7)',
  glass: 'rgba(255,255,255,0.35)',
  border: 'rgba(191, 174, 158, 0.2)',
  shadow: '0 8px 32px rgba(191, 174, 158, 0.10)',
  shadowHover: '0 16px 48px rgba(191, 174, 158, 0.18)',
  progressBg: 'rgba(191, 174, 158, 0.2)',
  progressFill: 'linear-gradient(90deg, #bfae9e 0%, #a68a6d 100%)',
};

const DonutChart = ({ percent, color }) => {
  const radius = 60;
  const stroke = 16;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const progress = circumference * (1 - percent / 100);
  return (
    <svg width={160} height={160} style={{ display: 'block', margin: '0 auto', background: 'none' }}>
      <defs>
        <linearGradient id="donutGradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={color} />
          <stop offset="100%" stopColor={THEME.primaryDark} />
        </linearGradient>
        <filter id="donutShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="8" stdDeviation="8" floodColor="#bfae9e" floodOpacity="0.18" />
        </filter>
      </defs>
      <circle
        cx={80}
        cy={80}
        r={normalizedRadius}
        fill="none"
        stroke="#eee"
        strokeWidth={stroke}
      />
      <motion.circle
        cx={80}
        cy={80}
        r={normalizedRadius}
        fill="none"
        stroke="url(#donutGradient)"
        strokeWidth={stroke}
        strokeDasharray={circumference}
        strokeDashoffset={circumference}
        animate={{ strokeDashoffset: progress }}
        transition={{ duration: 1.2, ease: 'easeInOut' }}
        style={{ filter: 'url(#donutShadow)', boxShadow: '0 0 32px 0 ' + color + '44' }}
        strokeLinecap="round"
      />
      <motion.text
        x={80}
        y={90}
        textAnchor="middle"
        fontSize="38"
        fontWeight="bold"
        fill={THEME.primaryDark}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.5 }}
      >{Math.round(percent)}%</motion.text>
    </svg>
  );
};

const LineChart = ({ data, color }) => {
  const width = 420;
  const height = 180;
  const padding = 36;
  const max = Math.max(...data.map(d => d.value), 1);
  const min = 0;
  const points = data.map((d, i) => {
    const x = padding + i * ((width - 2 * padding) / (data.length - 1));
    const y = height - padding - ((d.value - min) / (max - min || 1)) * (height - 2 * padding);
    return [x, y];
  });
  const pathD = points.reduce((acc, [x, y], i) => acc + (i === 0 ? `M${x},${y}` : ` L${x},${y}`), '');
  const total = data.reduce((acc, d) => acc + d.value, 0);
  const bestDay = data.reduce((best, d) => d.value > best.value ? d : best, data[0]);
  return (
    <svg width={width} height={height} style={{ width: '100%', maxWidth: 420, display: 'block', background: 'none', overflow: 'visible' }}>
      <defs>
        <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={color} />
          <stop offset="100%" stopColor={THEME.primaryDark} />
        </linearGradient>
        <filter id="lineShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#bfae9e" floodOpacity="0.12" />
        </filter>
      </defs>
      <text x={padding - 30} y={padding - 10} fontSize="14" fill={THEME.subtext} style={{ fontWeight: 600 }}>Tasks</text>
      <text x={width / 2} y={height - 5} textAnchor="middle" fontSize="14" fill={THEME.subtext} style={{ fontWeight: 600 }}>Day</text>
      <motion.path
        d={pathD + ` L${points[points.length - 1][0]},${height - padding} L${points[0][0]},${height - padding} Z`}
        fill={color + '22'}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
      />
      <motion.path
        d={pathD}
        fill="none"
        stroke="url(#lineGradient)"
        strokeWidth={4}
        filter="url(#lineShadow)"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.2, ease: 'easeInOut' }}
        strokeLinecap="round"
      />
      {points.map(([x, y], i) => (
        <motion.circle
          key={i}
          cx={x}
          cy={y}
          r={9}
          fill="#fff"
          stroke={color}
          strokeWidth={4}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.7 + i * 0.08, type: 'spring', stiffness: 200 }}
        />
      ))}
      {data.map((d, i) => (
        <text key={d.day} x={points[i][0]} y={height - padding + 22} textAnchor="middle" fontSize="15" fill={THEME.subtext} style={{ fontWeight: 600 }}>{d.day}</text>
      ))}
      {data.map((d, i) => (
        <motion.text
          key={d.day + '-val'}
          x={points[i][0]}
          y={points[i][1] - 18}
          textAnchor="middle"
          fontSize="16"
          fill={color}
          fontWeight="bold"
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 + i * 0.08, duration: 0.5 }}
        >{d.value}</motion.text>
      ))}
      <rect x={width - 120} y={padding - 30} width={18} height={18} rx={5} fill={color + '99'} />
      <text x={width - 95} y={padding - 16} fontSize="15" fill={THEME.text} style={{ fontWeight: 700 }}>Tasks Completed</text>
      <text x={width - 120} y={height - 10} fontSize="15" fill={THEME.primaryDark} style={{ fontWeight: 700 }}>Total: {total}</text>
    </svg>
  );
};

// Add new color palette for graphs
const GRAPH_COLORS = {
  donut: 'url(#donutGradientGold)',
  streak: '#f093fb',
  hours: 'url(#lineGradientGold)',
  active: '#43e97b',
};

// New: StreakBar component
const StreakBar = ({ streak, maxStreak }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '18px 0 0 0' }}>
    <FaFire size={28} color={GRAPH_COLORS.streak} style={{ filter: 'drop-shadow(0 2px 8px #f093fb44)' }} />
    <div style={{ fontWeight: 800, fontSize: 22, color: GRAPH_COLORS.streak, letterSpacing: -1 }}>Streak: {streak} days</div>
  </div>
);

// New: BarGraph for active days
const BarGraph = ({ data, color }) => {
  const width = 320;
  const height = 90;
  const padding = 24;
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <svg width={width} height={height} style={{ width: '100%', maxWidth: 320, display: 'block', background: 'none', overflow: 'visible' }}>
      {data.map((d, i) => {
        const barHeight = ((d.value / max) * (height - 2 * padding)) || 0;
        return (
          <g key={d.day}>
            <rect
              x={padding + i * ((width - 2 * padding) / data.length)}
              y={height - padding - barHeight}
              width={22}
              height={barHeight}
              rx={6}
              fill={color}
              style={{ filter: 'drop-shadow(0 2px 8px ' + color + '33)' }}
            />
            <text x={padding + i * ((width - 2 * padding) / data.length) + 11} y={height - padding + 18} textAnchor="middle" fontSize="15" fill={THEME.subtext} style={{ fontWeight: 600 }}>{d.day}</text>
            <text x={padding + i * ((width - 2 * padding) / data.length) + 11} y={height - padding - barHeight - 8} textAnchor="middle" fontSize="14" fill={color} fontWeight="bold">{d.value}</text>
          </g>
        );
      })}
    </svg>
  );
};

// New: Estimate study hours from tasks (1 task = 20min)
const estimateStudyHours = (dailyActivity) => dailyActivity.map(d => ({ ...d, value: +(d.value * (20/60)).toFixed(2) }));

const Dashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]); // playlists with tasks
  const [progress, setProgress] = useState([]); // user progress per course
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Live clock
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch user, courses, and progress
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);
    axios.get('/user')
      .then(userRes => {
        if (!isMounted) return;
        if (!userRes.data) {
          setUser(null);
          setCourses([]);
          setProgress([]);
          setLoading(false);
          return;
        }
        setUser(userRes.data);
        // --- REDIRECT if user has not completed general form ---
        if (userRes.data && userRes.data.has_completed_general_form === false) {
          navigate('/placement-test/1');
          return;
        }
        Promise.all([
          axios.get('/courses'),
          axios.get('/user-progress/all'),
        ])
          .then(([coursesRes, progressRes]) => {
            if (!isMounted) return;
            setCourses(coursesRes.data);
            setProgress(progressRes.data);
          })
          .catch(() => setError('Failed to load dashboard data.'))
          .finally(() => setLoading(false));
      })
      .catch(() => {
        if (!isMounted) return;
        setUser(null);
        setCourses([]);
        setProgress([]);
        setLoading(false);
      });
    return () => { isMounted = false; };
  }, [navigate]);

  // Aggregate daily activity: count of completed tasks per day (last 7 days)
  const dailyActivity = (() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const now = new Date();
    const last7 = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now);
      d.setDate(now.getDate() - (6 - i));
      return d;
    });
    // Flatten all completed_tasks with their updated_at date
    let completions = [];
    progress.forEach(p => {
      if (Array.isArray(p.completed_tasks) && p.updated_at) {
        completions.push({ date: new Date(p.updated_at) });
      }
    });
    // Count completions per day
    return last7.map((date, i) => {
      const day = days[date.getDay() === 0 ? 6 : date.getDay() - 1];
      const count = completions.filter(c => c.date.toDateString() === date.toDateString()).length;
      return { day, value: count };
    });
  })();

  // Stats (demo for now)
  const learningStats = user ? [
    { label: 'Study Hours', value: 3.5, color: THEME.accentBlue, icon: FaChartLine },
    { label: 'Tasks', value: progress.reduce((acc, p) => acc + (Array.isArray(p.completed_tasks) ? p.completed_tasks.length : 0), 0), color: THEME.accentGreen, icon: FaBook },
    { label: 'Points', value: user?.points || 0, color: THEME.accentYellow, icon: FaMedal },
    { label: 'Streak', value: 12, color: THEME.accentPink, icon: FaFire },
  ] : [];
  // Achievements (demo for now)
  const achievements = user ? [
    { id: 1, title: 'Active Learner', description: 'Completed 5 tasks in a day', icon: FaFire, color: THEME.accentPink },
    { id: 2, title: 'Quiz Master', description: 'Scored 100% on a quiz', icon: FaMedal, color: THEME.accentYellow },
  ] : [];

  if (loading) {
    return (
      <div className="user-loading-container">
        <div className="user-loading-spinner"></div>
      </div>
    );
  }
  if (error) {
    return <div style={{ color: 'red', textAlign: 'center', marginTop: 40 }}>{error}</div>;
  }
  // Defensive: If user is null, or courses/progress are not arrays, render nothing
  if (!user || !Array.isArray(courses) || !Array.isArray(progress)) {
    return null;
  }

  return (
    <div className="dashboard-container" style={{ background: 'linear-gradient(135deg, #f5e9da 0%, #e8dcc0 40%, #f5f5f5 100%)', minHeight: '100vh', padding: 0, overflowY: 'auto', position: 'relative' }}>
      {/* Animated background shapes */}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.22 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 0,
            pointerEvents: 'none',
            background: 'radial-gradient(circle at 20% 30%, #bfae9e44 0%, transparent 60%), radial-gradient(circle at 80% 70%, #4facfe33 0%, transparent 60%), radial-gradient(circle at 60% 10%, #ffd70033 0%, transparent 60%)',
          }}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.12, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5 }}
          style={{
            position: 'fixed',
            top: '60%',
            left: '10%',
            width: 320,
            height: 320,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #f093fb55 0%, #43e97b55 100%)',
            filter: 'blur(40px)',
            zIndex: 0,
            pointerEvents: 'none',
          }}
        />
      </AnimatePresence>
      {/* Hero Welcome Section */}
      <motion.section className="dashboard-header" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.7, type: 'spring', stiffness: 60 }} style={{ background: THEME.glass, boxShadow: THEME.shadow, borderRadius: 32, margin: '80px auto 48px auto', maxWidth: 1200, padding: '48px 40px', backdropFilter: 'blur(32px)', position: 'relative', zIndex: 1, overflow: 'visible' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
            <div style={{ width: 90, height: 90, borderRadius: '50%', background: THEME.cardBg, boxShadow: THEME.shadow, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: `3px solid ${THEME.primary}` }}>
              {user.avatar ? (
                <img src={user.avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <FaUserCircle size={70} color={THEME.primaryDark} />
              )}
            </div>
            <div>
              <div className="welcome-title" style={{ fontSize: 38, fontWeight: 900, color: THEME.text, letterSpacing: -1, marginBottom: 8 }}>Welcome back, <span className="username" style={{ background: `linear-gradient(135deg, ${THEME.primary} 0%, ${THEME.primaryDark} 100%)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{user.username}</span></div>
              <div className="welcome-subtitle" style={{ fontSize: 22, color: THEME.subtext, marginBottom: 8 }}>Keep pushing your limits and achieve greatness!</div>
              <div style={{ fontSize: 16, color: THEME.primaryDark, fontWeight: 600, marginTop: 6 }}>Level {user.level} • {user.points} Points</div>
          </div>
          </div>
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.3, type: 'spring', stiffness: 120 }} style={{ fontSize: 28, fontWeight: 700, color: THEME.primaryDark, background: '#fff', borderRadius: 16, padding: '18px 38px', boxShadow: '0 2px 16px #eee', alignSelf: 'flex-start' }}>{currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</motion.div>
        </div>
      </motion.section>

      {/* Daily Activity Graph */}
      <motion.section className="learning-insights-section" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.7, type: 'spring', stiffness: 60 }} style={{ maxWidth: 1200, margin: '0 auto 48px auto', background: THEME.cardBg, borderRadius: 32, boxShadow: THEME.shadow, padding: 48, position: 'relative', overflow: 'visible', zIndex: 1 }}>
        {/* Section Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 32 }}>
          <FaChartLine size={32} color={THEME.primaryDark} />
          <span style={{ fontSize: 34, fontWeight: 900, background: 'linear-gradient(90deg, #bfae9e 0%, #f093fb 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: -1 }}>Learning Insights</span>
            </div>
        <div style={{ borderTop: '1.5px solid #e8dcc0', marginBottom: 36, opacity: 0.5 }} />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 48, alignItems: 'flex-start', justifyContent: 'space-between' }}>
          {/* Donut Progress */}
          <div style={{ minWidth: 220, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.7)', borderRadius: 24, boxShadow: THEME.shadow, padding: 24, marginBottom: 24 }}>
            <DonutChart percent={Math.round((progress.reduce((acc, p) => acc + (Array.isArray(p.completed_tasks) ? p.completed_tasks.length : 0), 0) / (courses.reduce((acc, c) => acc + (Array.isArray(c.tasks) ? c.tasks.length : 0), 0) || 1)) * 100)} color={GRAPH_COLORS.donut} />
            <div style={{ marginTop: 18, fontWeight: 800, fontSize: 22, color: THEME.primaryDark, textAlign: 'center', letterSpacing: -1 }}>Overall Progress</div>
            <div style={{ color: THEME.subtext, fontSize: 15, marginTop: 4 }}>All courses</div>
          </div>
          {/* Streak Bar */}
          <div style={{ minWidth: 220, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.7)', borderRadius: 24, boxShadow: THEME.shadow, padding: 24, marginBottom: 24 }}>
            <StreakBar streak={dailyActivity.filter(d => d.value > 0).length} maxStreak={Math.max(...dailyActivity.map(d => d.value > 0 ? d.value : 0), 0)} />
            <div style={{ color: THEME.subtext, fontSize: 15, marginTop: 8 }}>Active days this week</div>
          </div>
          {/* Study Hours Line Graph */}
          <div style={{ minWidth: 320, flex: 2, background: 'rgba(255,255,255,0.7)', borderRadius: 24, boxShadow: THEME.shadow, padding: 24, marginBottom: 24 }}>
            <div style={{ fontWeight: 800, fontSize: 20, color: THEME.text, marginBottom: 8 }}>Estimated Study Hours</div>
            <LineChart data={estimateStudyHours(dailyActivity)} color={THEME.primaryDark} />
            <div style={{ color: THEME.subtext, fontSize: 15, marginTop: 8 }}>Assuming 20 min per task</div>
          </div>
          {/* Active Days Bar Graph */}
          <div style={{ minWidth: 320, flex: 2, background: 'rgba(255,255,255,0.7)', borderRadius: 24, boxShadow: THEME.shadow, padding: 24, marginBottom: 24 }}>
            <div style={{ fontWeight: 800, fontSize: 20, color: THEME.text, marginBottom: 8 }}>Active Days</div>
            <BarGraph data={dailyActivity} color={GRAPH_COLORS.active} />
            <div style={{ color: THEME.subtext, fontSize: 15, marginTop: 8 }}>Tasks completed per day</div>
          </div>
        </div>
      </motion.section>

      {/* Stats + Donut Progress */}
      <motion.section className="user-stats-section" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.7, type: 'spring', stiffness: 60 }} style={{ maxWidth: 1200, margin: '0 auto 48px auto', display: 'flex', gap: 48, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
        <div style={{ flex: 1, minWidth: 320 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 32 }}>
            {learningStats.map((stat, i) => (
              <motion.div key={stat.label} className="stat-card" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + i * 0.08, duration: 0.5, type: 'spring', stiffness: 80 }} whileHover={{ scale: 1.07, boxShadow: THEME.shadowHover }} style={{ background: THEME.cardBg, borderRadius: 24, boxShadow: THEME.shadow, padding: 36, display: 'flex', alignItems: 'center', gap: 22, cursor: 'pointer', border: `1.5px solid ${THEME.border}`, position: 'relative', zIndex: 1 }}>
                <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 2 + i * 0.2, ease: 'easeInOut' }} style={{ background: stat.color + '22', borderRadius: '50%', width: 54, height: 54, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 14, boxShadow: '0 2px 8px ' + stat.color + '22' }}>{React.createElement(stat.icon, { size: 18, color: stat.color })}</motion.div>
                <div>
                  <motion.div style={{ fontWeight: 800, fontSize: 28, color: THEME.text }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.1 }}>{stat.value}</motion.div>
                  <div style={{ color: THEME.subtext, fontSize: 17 }}>{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </div>
              </div>
        <div style={{ minWidth: 220, margin: '0 32px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <DonutChart percent={Math.round((progress.reduce((acc, p) => acc + (Array.isArray(p.completed_tasks) ? p.completed_tasks.length : 0), 0) / (courses.reduce((acc, c) => acc + (Array.isArray(c.tasks) ? c.tasks.length : 0), 0) || 1)) * 100)} color={THEME.primary} />
        </div>
      </motion.section>

      {/* Current Courses */}
      <motion.section className="current-courses-section" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.7, type: 'spring', stiffness: 60 }} style={{ maxWidth: 1200, margin: '0 auto 48px auto' }}>
        <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 28, color: THEME.text, letterSpacing: -1 }}>My Courses</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 40 }}>
          {courses.length > 0 ? courses.map((course, i) => {
            const userProg = progress.find(p => p.playlist_id === course.id);
            const completed = Array.isArray(userProg?.completed_tasks) ? userProg.completed_tasks.length : 0;
            const total = Array.isArray(course.tasks) ? course.tasks.length : 0;
            const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
            return (
              <motion.div key={course.id || i} className="stat-card" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + i * 0.08, duration: 0.5, type: 'spring', stiffness: 80 }} whileHover={{ scale: 1.06, boxShadow: THEME.shadowHover }} style={{ background: 'rgba(255,255,255,0.85)', borderRadius: 28, boxShadow: THEME.shadow, padding: 36, alignItems: 'flex-start', border: `1.5px solid ${THEME.border}`, position: 'relative', overflow: 'visible', minHeight: 220, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'box-shadow 0.2s' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 18 }}>
                  <div style={{ width: 70, height: 70, background: THEME.progressBg, borderRadius: 18, marginRight: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px #bfae9e33', overflow: 'hidden' }}>
                    {course.thumbnail ? (
                      <img src={course.thumbnail} alt="course" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 18 }} />
                    ) : (
                      <div style={{ width: 60, height: 60, borderRadius: 16, background: 'linear-gradient(135deg, #bfae9e 0%, #a68a6d 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FaRegImage size={34} color="#fff" />
                </div>
                    )}
              </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 22, color: THEME.text }}>{course.name || 'Course'}</div>
                    <div style={{ color: THEME.subtext, fontSize: 16 }}>{course.instructor || ''}</div>
                </div>
                </div>
                <div style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, color: THEME.subtext }}>
                    <span>Tasks</span>
                    <span style={{ fontWeight: 700, color: THEME.primaryDark }}>{completed}/{total} ({percent}%)</span>
              </div>
                  <div style={{ width: '100%', height: 10, background: THEME.progressBg, borderRadius: 5, marginTop: 10, position: 'relative', overflow: 'hidden' }}>
                    <motion.div style={{ height: '100%', background: THEME.progressFill, borderRadius: 5, boxShadow: '0 2px 8px #bfae9e55' }} initial={{ width: 0 }} animate={{ width: `${percent}%` }} transition={{ duration: 1, ease: 'easeInOut' }} />
                </div>
                </div>
                <motion.button whileHover={{ scale: 1.04, boxShadow: THEME.shadowHover }} style={{ marginTop: 22, width: '100%', background: THEME.progressFill, color: '#fff', border: 'none', borderRadius: 10, padding: '14px 0', fontWeight: 800, fontSize: 17, cursor: 'pointer', letterSpacing: 1, boxShadow: '0 2px 8px #bfae9e33', transition: 'all 0.2s' }}>Continue</motion.button>
            </motion.div>
            );
          }) : (
            <div className="stat-card" style={{ background: THEME.cardBg, borderRadius: 24, boxShadow: THEME.shadow, padding: 32, alignItems: 'flex-start', border: `1.5px solid ${THEME.border}` }}>No courses found. Start learning now!</div>
          )}
      </div>
      </motion.section>

      {/* Achievements */}
      <motion.section className="achievements-section" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.7, type: 'spring', stiffness: 60 }} style={{ maxWidth: 1200, margin: '0 auto 48px auto' }}>
        <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 28, color: THEME.text, letterSpacing: -1 }}>Achievements</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 32 }}>
          {achievements.map((ach, i) => (
            <motion.div key={ach.id} className="stat-card" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 + i * 0.08, duration: 0.5, type: 'spring', stiffness: 80 }} whileHover={{ scale: 1.07, boxShadow: THEME.shadowHover }} style={{ background: THEME.cardBg, borderRadius: 24, boxShadow: THEME.shadow, padding: 28, display: 'flex', alignItems: 'center', gap: 22, border: `1.5px solid ${THEME.border}`, position: 'relative', overflow: 'visible' }}>
              <motion.div animate={{ rotate: [0, 8, -8, 0] }} transition={{ repeat: Infinity, duration: 3 + i, ease: 'easeInOut' }} style={{ background: THEME.accentYellow + '22', borderRadius: '50%', width: 54, height: 54, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 14, boxShadow: '0 2px 8px ' + THEME.accentYellow + '22', border: `2.5px solid ${THEME.accentYellow}` }}>{React.createElement(ach.icon, { size: 20, color: ach.color })}</motion.div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 19, color: THEME.text }}>{ach.title}</div>
                <div style={{ color: THEME.subtext, fontSize: 15, marginTop: 8 }}>{ach.description}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>
    </div>
  );
};

export default Dashboard;