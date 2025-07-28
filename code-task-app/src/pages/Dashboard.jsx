import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBook, FaMedal, FaFire, FaChartLine, FaPlayCircle, FaUserCircle, FaRegImage } from 'react-icons/fa';
import axios from '../api/axios';
import '../styles/Dashboard.css';
import { useNavigate } from 'react-router-dom';

const THEME = {
  primary: '#bfae9e',
  primaryDark: '#a68a6d',
  accentGold: '#e3cfa4',
  accentBrown: '#7d6a4d',
  accentBeige: '#f5f1eb',
  accentTeal: '#A7C7C5',
  accentPink: '#F7D6D0',
  accentSage: '#D6E5D8',
  accentSand: '#F3E9D2',
  accentBlue: '#7EC4CF', // for contrast
  accentCoral: '#FFB6A3', // for contrast
  text: '#7d6a4d',
  subtext: '#b5a079',
  cardBg: 'rgba(245, 241, 235, 0.95)',
  glass: 'rgba(245, 241, 235, 0.85)',
  border: 'rgba(191, 174, 158, 0.2)',
  shadow: '0 8px 32px rgba(191, 174, 158, 0.10)',
  shadowHover: '0 16px 48px rgba(191, 174, 158, 0.18)',
  progressBg: 'rgba(191, 174, 158, 0.13)',
  progressFill: 'linear-gradient(90deg, #e3cfa4 0%, #bfae9e 100%)',
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
  const height = 200; // Increased height to accommodate labels
  const padding = 36;
  const max = Math.max(...data.map(d => d.value), 1);
  const min = 0;
  const points = data.map((d, i) => {
    const x = padding + i * ((width - 2 * padding) / (data.length - 1));
    const y = height - padding - 20 - ((d.value - min) / (max - min || 1)) * (height - 2 * padding - 20); // Adjusted y calculation
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
      <text x={width / 2} y={height - 8} textAnchor="middle" fontSize="14" fill={THEME.subtext} style={{ fontWeight: 600 }}>Day</text>
      <motion.path
        d={pathD + ` L${points[points.length - 1][0]},${height - padding - 20} L${points[0][0]},${height - padding - 20} Z`}
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
        <text key={d.day} x={points[i][0]} y={height - padding + 8} textAnchor="middle" fontSize="15" fill={THEME.subtext} style={{ fontWeight: 600 }}>{d.day}</text>
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
      <text x={width - 120} y={height - 2} fontSize="15" fill={THEME.primaryDark} style={{ fontWeight: 700 }}>Total: {total}</text>
    </svg>
  );
};

// Add new color palette for graphs
const GRAPH_COLORS = {
  donut: '#e3cfa4',
  streak: '#bfae9e',
  hours: '#a68a6d',
  active: '#7d6a4d',
};

// New: StreakBar component
const StreakBar = ({ streak, maxStreak }) => (
  <div style={{ 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    gap: 16, 
    margin: '18px 0 0 0',
    background: 'rgba(255,255,255,0.8)',
    borderRadius: 20,
    padding: '24px 20px',
    boxShadow: '0 4px 16px rgba(191, 174, 158, 0.15)',
    border: '1px solid rgba(191, 174, 158, 0.1)'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <FaFire size={28} color={GRAPH_COLORS.streak} style={{ filter: 'drop-shadow(0 2px 8px #f093fb44)' }} />
      <div style={{ fontWeight: 800, fontSize: 22, color: GRAPH_COLORS.streak, letterSpacing: -1 }}>Streak: {streak} days</div>
    </div>
    <div style={{ 
      color: THEME.subtext, 
      fontSize: 15, 
      fontWeight: 600,
      textAlign: 'center',
      padding: '8px 16px',
      background: 'rgba(191, 174, 158, 0.1)',
      borderRadius: 12,
      border: '1px solid rgba(191, 174, 158, 0.2)'
    }}>Active days this week</div>
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

// Motivational quotes/tips
const MOTIVATIONAL_QUOTES = [
  "Every day is a new opportunity to learn.",
  "Small steps every day lead to big results.",
  "Consistency is the key to mastery.",
  "Your future is created by what you do today, not tomorrow.",
  "Learning never exhausts the mind.",
  "Push yourself, because no one else is going to do it for you.",
  "Success is the sum of small efforts repeated day in and day out.",
  "Dream big, work hard, stay focused.",
  "The expert in anything was once a beginner.",
  "Education is the passport to the future."
];

function getRandomQuote(lastIdx) {
  let idx;
  do {
    idx = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length);
  } while (idx === lastIdx);
  return { quote: MOTIVATIONAL_QUOTES[idx], idx };
}

// Animated counter hook
function useCountUp(target, duration = 1200) {
  const [count, setCount] = useState(0);
  const ref = useRef();
  useEffect(() => {
    let start = 0;
    const step = Math.ceil(target / (duration / 16));
    let frame;
    function animate() {
      start += step;
      if (start >= target) {
        setCount(target);
        return;
      }
      setCount(start);
      frame = requestAnimationFrame(animate);
    }
    animate();
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);
  return count;
}

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

  // Achievements (demo for now)
  const achievements = user ? [
    { id: 1, title: 'Active Learner', description: 'Completed 5 tasks in a day', icon: FaFire, color: THEME.accentGold },
    { id: 2, title: 'Quiz Master', description: 'Scored 100% on a quiz', icon: FaMedal, color: THEME.accentGold },
  ] : [];

  const [quoteIdx, setQuoteIdx] = useState(0);
  const [quote, setQuote] = useState(MOTIVATIONAL_QUOTES[0]);
  const [quoteVisible, setQuoteVisible] = useState(true);

  // Cycle quote every 8s with fade animation
  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteVisible(false);
      setTimeout(() => {
        const { quote: newQuote, idx } = getRandomQuote(quoteIdx);
        setQuote(newQuote);
        setQuoteIdx(idx);
        setQuoteVisible(true);
      }, 600); // fade out duration
    }, 8000);
    return () => clearInterval(interval);
  }, [quoteIdx]);

  const pointsCount = useCountUp(user?.points || 0);
  const levelCount = useCountUp(user?.level || 1);

  // Find in-progress course for 'Continue where you left off'
  const inProgressCourse = courses.find(course => {
    const userProg = progress.find(p => p.playlist_id === course.id);
    const completed = Array.isArray(userProg?.completed_tasks) ? userProg.completed_tasks.length : 0;
    const total = Array.isArray(course.tasks) ? course.tasks.length : 0;
    return completed > 0 && completed < total;
  });

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
      <motion.section className="dashboard-hero" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.7, type: 'spring', stiffness: 60 }} style={{ background: THEME.glass, boxShadow: THEME.shadow, borderRadius: 32, margin: '80px auto 48px auto', maxWidth: 1200, padding: '56px 40px 40px 40px', backdropFilter: 'blur(32px)', position: 'relative', zIndex: 2, overflow: 'visible', minHeight: 260 }}>
        {/* Floating sparkles */}
        <motion.div initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 0.18, scale: 1 }} transition={{ duration: 1.2 }} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none', background: 'radial-gradient(circle at 20% 30%, #e3cfa4aa 0%, transparent 60%), radial-gradient(circle at 80% 70%, #bfae9e66 0%, transparent 60%)' }} />
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 32, position: 'relative', zIndex: 1 }}>
          {/* Animated avatar and greeting */}
          <motion.div initial={{ x: -60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 80 }} style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
            <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.3, type: 'spring', stiffness: 120 }} style={{ width: 100, height: 100, borderRadius: '50%', background: THEME.cardBg, boxShadow: THEME.shadow, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: `3.5px solid ${THEME.primary}` }}>
              {user.avatar ? (
                <img src={user.avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <FaUserCircle size={80} color={THEME.primaryDark} />
              )}
            </motion.div>
            <div>
              <div style={{ fontSize: 44, fontWeight: 900, color: THEME.text, letterSpacing: -1, marginBottom: 8, lineHeight: 1.1 }}>Good {currentTime.getHours() < 12 ? 'morning' : currentTime.getHours() < 18 ? 'afternoon' : 'evening'}, <span style={{ background: `linear-gradient(135deg, ${THEME.primary} 0%, ${THEME.primaryDark} 100%)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{user.username}</span>!</div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: quoteVisible ? 1 : 0, y: quoteVisible ? 0 : 10 }}
                transition={{ duration: 0.6 }}
                style={{ fontSize: 22, color: THEME.subtext, marginBottom: 8, fontWeight: 600 }}
              >
                {quote}
              </motion.div>
              <div style={{ fontSize: 18, color: THEME.primaryDark, fontWeight: 700, marginTop: 6 }}>Level <span style={{ fontSize: 22, fontWeight: 900 }}>{levelCount}</span> • <span style={{ color: THEME.accentGold }}>{pointsCount} Points</span></div>
            </div>
          </motion.div>
          {/* Live clock */}
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.3, type: 'spring', stiffness: 120 }} style={{ fontSize: 32, fontWeight: 700, color: THEME.primaryDark, background: '#fff', borderRadius: 16, padding: '22px 44px', boxShadow: '0 2px 16px #eee', alignSelf: 'flex-start' }}>{currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</motion.div>
          {/* Today's Goal / Quick Tip */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, type: 'spring', stiffness: 80 }} style={{ background: THEME.accentGold, color: THEME.text, borderRadius: 18, boxShadow: THEME.shadow, padding: '24px 32px', minWidth: 260, maxWidth: 340, fontWeight: 700, fontSize: 20, marginLeft: 'auto', marginTop: 12, alignSelf: 'flex-start', letterSpacing: 0.5, display: 'flex', alignItems: 'center', gap: 16 }}>
            <FaChartLine size={28} color={THEME.primaryDark} style={{ marginRight: 8 }} />
            <span>Today’s Goal: <span style={{ color: THEME.primaryDark, fontWeight: 900 }}>Complete 1 new task!</span></span>
          </motion.div>
        </div>
        {/* Continue where you left off */}
        {inProgressCourse && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.8, type: 'spring', stiffness: 80 }} 
            style={{ 
              marginTop: 32, 
              background: THEME.accentBeige, 
              borderRadius: 18, 
              boxShadow: THEME.shadow, 
              padding: '22px 32px', 
              fontWeight: 700, 
              fontSize: 19, 
              color: THEME.text, 
              display: 'flex', 
              alignItems: 'center', 
              gap: 18, 
              cursor: 'pointer', 
              border: `2px solid ${THEME.primary}`,
              transition: 'all 0.2s ease'
            }} 
            onClick={() => navigate(`/course/${inProgressCourse.id}`)}
            whileHover={{ 
              scale: 1.02, 
              boxShadow: THEME.shadowHover,
              background: THEME.accentGold
            }}
          >
            <FaPlayCircle size={28} color={THEME.primaryDark} />
            <span>Continue where you left off: <span style={{ color: THEME.primaryDark, fontWeight: 900 }}>{inProgressCourse.name}</span></span>
          </motion.div>
        )}
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
          <div style={{ 
            minWidth: 220, 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            background: 'rgba(255,255,255,0.85)', 
            borderRadius: 24, 
            boxShadow: THEME.shadow, 
            padding: 28, 
            marginBottom: 24,
            border: '1px solid rgba(191, 174, 158, 0.15)',
            backdropFilter: 'blur(10px)'
          }}>
            <DonutChart percent={Math.round((progress.reduce((acc, p) => acc + (Array.isArray(p.completed_tasks) ? p.completed_tasks.length : 0), 0) / (courses.reduce((acc, c) => acc + (Array.isArray(c.tasks) ? c.tasks.length : 0), 0) || 1)) * 100)} color={GRAPH_COLORS.donut} />
            <div style={{ marginTop: 18, fontWeight: 800, fontSize: 22, color: THEME.primaryDark, textAlign: 'center', letterSpacing: -1 }}>Overall Progress</div>
            <div style={{ color: THEME.subtext, fontSize: 15, marginTop: 4 }}>All courses</div>
          </div>
          {/* Streak Bar */}
          <div style={{ 
            minWidth: 220, 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            background: 'rgba(255,255,255,0.85)', 
            borderRadius: 24, 
            boxShadow: THEME.shadow, 
            padding: 28, 
            marginBottom: 24,
            border: '1px solid rgba(191, 174, 158, 0.15)',
            backdropFilter: 'blur(10px)'
          }}>
            <StreakBar streak={dailyActivity.filter(d => d.value > 0).length} maxStreak={Math.max(...dailyActivity.map(d => d.value > 0 ? d.value : 0), 0)} />
          </div>
          {/* Study Hours Line Graph */}
          <div style={{ 
            minWidth: 320, 
            flex: 2, 
            background: 'rgba(255,255,255,0.85)', 
            borderRadius: 24, 
            boxShadow: THEME.shadow, 
            padding: 28, 
            marginBottom: 24,
            border: '1px solid rgba(191, 174, 158, 0.15)',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{ fontWeight: 800, fontSize: 20, color: THEME.text, marginBottom: 12 }}>Estimated Study Hours</div>
            <LineChart data={estimateStudyHours(dailyActivity)} color={GRAPH_COLORS.hours} />
            <div style={{ color: THEME.subtext, fontSize: 15, marginTop: 8 }}>Assuming 20 min per task</div>
          </div>
          {/* Active Days Bar Graph */}
          <div style={{ 
            minWidth: 320, 
            flex: 2, 
            background: 'rgba(255,255,255,0.85)', 
            borderRadius: 24, 
            boxShadow: THEME.shadow, 
            padding: 28, 
            marginBottom: 24,
            border: '1px solid rgba(191, 174, 158, 0.15)',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{ fontWeight: 800, fontSize: 20, color: THEME.text, marginBottom: 12 }}>Active Days</div>
            <BarGraph data={dailyActivity} color={GRAPH_COLORS.active} />
            <div style={{ color: THEME.subtext, fontSize: 15, marginTop: 8 }}>Tasks completed per day</div>
          </div>
        </div>
      </motion.section>

      {/* My Courses */}
      <motion.section className="current-courses-section" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.7, type: 'spring', stiffness: 60 }} style={{ maxWidth: 1200, margin: '0 auto 48px auto', background: THEME.cardBg, borderRadius: 32, boxShadow: THEME.shadow, padding: 48, position: 'relative', overflow: 'visible', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 32 }}>
          <FaBook size={32} color={THEME.primaryDark} />
          <span style={{ fontSize: 34, fontWeight: 900, background: 'linear-gradient(90deg, #bfae9e 0%, #e3cfa4 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: -1 }}>My Courses</span>
          <span style={{ marginLeft: 'auto', fontSize: 18, color: THEME.subtext, fontWeight: 700 }}>
            Total: {courses.length} | Completed: {courses.filter(course => {
              const userProg = progress.find(p => p.playlist_id === course.id);
              const completed = Array.isArray(userProg?.completed_tasks) ? userProg.completed_tasks.length : 0;
              const total = Array.isArray(course.tasks) ? course.tasks.length : 0;
              return total > 0 && completed === total;
            }).length}
          </span>
        </div>
        <div style={{ borderTop: '1.5px solid #e8dcc0', marginBottom: 36, opacity: 0.5 }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 40 }}>
          {courses.length > 0 ? courses.map((course, i) => {
            const userProg = progress.find(p => p.playlist_id === course.id);
            const completed = Array.isArray(userProg?.completed_tasks) ? userProg.completed_tasks.length : 0;
            const total = Array.isArray(course.tasks) ? course.tasks.length : 0;
            const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
            const isNew = course.created_at && new Date(course.created_at).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000; // Check if course is new (created in last 7 days)
            const isInProgress = completed > 0 && completed < total;

            return (
              <motion.div 
                key={course.id || i} 
                className="stat-card" 
                initial={{ opacity: 0, y: 30 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.5 + i * 0.08, duration: 0.5, type: 'spring', stiffness: 80 }} 
                whileHover={{ scale: 1.06, boxShadow: THEME.shadowHover }} 
                style={{ 
                  background: 'rgba(255,255,255,0.9)', 
                  borderRadius: 28, 
                  boxShadow: THEME.shadow, 
                  padding: 36, 
                  alignItems: 'flex-start', 
                  border: `1.5px solid ${THEME.border}`, 
                  position: 'relative', 
                  overflow: 'visible', 
                  minHeight: 220, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'space-between', 
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(10px)'
                }}
              >
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
                <motion.button 
                  whileHover={{ scale: 1.04, boxShadow: THEME.shadowHover }} 
                  style={{ marginTop: 22, width: '100%', background: THEME.progressFill, color: '#fff', border: 'none', borderRadius: 10, padding: '14px 0', fontWeight: 800, fontSize: 17, cursor: 'pointer', letterSpacing: 1, boxShadow: '0 2px 8px #bfae9e33', transition: 'all 0.2s' }}
                  onClick={() => navigate(`/course/${course.id}`)}
                >
                  Continue
                </motion.button>
            </motion.div>
            );
          }) : (
            <div className="stat-card" style={{ background: THEME.cardBg, borderRadius: 24, boxShadow: THEME.shadow, padding: 32, alignItems: 'flex-start', border: `1.5px solid ${THEME.border}` }}>No courses found. Start learning now!</div>
          )}
      </div>
      </motion.section>

      {/* Achievements */}
      <motion.section className="achievements-section" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.7, type: 'spring', stiffness: 60 }} style={{ maxWidth: 1200, margin: '0 auto 48px auto', background: THEME.cardBg, borderRadius: 32, boxShadow: THEME.shadow, padding: 48, position: 'relative', overflow: 'visible', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 32 }}>
          <FaMedal size={32} color={THEME.primaryDark} />
          <span style={{ fontSize: 34, fontWeight: 900, background: 'linear-gradient(90deg, #bfae9e 0%, #e3cfa4 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: -1 }}>Achievements</span>
        </div>
        <div style={{ borderTop: '1.5px solid #e8dcc0', marginBottom: 36, opacity: 0.5 }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 32 }}>
          {achievements.length > 0 ? achievements.map((ach, i) => (
            <motion.div key={ach.id} className="stat-card" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 + i * 0.08, duration: 0.5, type: 'spring', stiffness: 80 }} whileHover={{ scale: 1.07, boxShadow: THEME.shadowHover }} style={{ background: THEME.cardBg, borderRadius: 24, boxShadow: THEME.shadow, padding: 28, display: 'flex', alignItems: 'center', gap: 22, border: `1.5px solid ${THEME.border}`, position: 'relative', overflow: 'visible' }}>
              <motion.div animate={{ rotate: [0, 8, -8, 0] }} transition={{ repeat: Infinity, duration: 3 + i, ease: 'easeInOut' }} style={{ background: THEME.accentGold + '22', borderRadius: '50%', width: 54, height: 54, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 14, boxShadow: '0 2px 8px ' + THEME.accentGold + '22', border: `2.5px solid ${THEME.accentGold}` }}>{React.createElement(ach.icon, { size: 20, color: ach.color })}</motion.div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 19, color: THEME.text }}>{ach.title}</div>
                <div style={{ color: THEME.subtext, fontSize: 15, marginTop: 8 }}>{ach.description}</div>
              </div>
            </motion.div>
          )) : (
            <div className="stat-card" style={{ background: THEME.cardBg, borderRadius: 24, boxShadow: THEME.shadow, padding: 32, alignItems: 'flex-start', border: `1.5px solid ${THEME.border}` }}>No achievements yet. Keep up the good work!</div>
          )}
        </div>
      </motion.section>
    </div>
  );
};

export default Dashboard;