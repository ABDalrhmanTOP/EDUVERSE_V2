import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "./navbar";
import "../styles/Homepage.css";
import { FaChalkboardTeacher, FaUsers, FaChartLine, FaRobot, FaHeadset, FaQuoteLeft, FaCheckCircle, FaFeatherAlt } from "react-icons/fa";
import { useInView } from "react-intersection-observer";
import SplitAuthModal from "./SplitAuthModal";
import { FaEnvelope, FaPhone, FaFacebook, FaInstagram, FaLinkedin, FaWhatsapp } from "react-icons/fa";
import { SiX } from "react-icons/si";
import eduverseLogo from "../assets/2.png";

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.3 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } },
};

// --- Animated Intro Section ---
const HERO_BG_URL = "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=1200&q=80";

const AnimatedIntro = ({ isLoggedIn, onCtaClick }) => (
  <section className="animated-intro-section">
    <div className="intro-bg-image" style={{ backgroundImage: `url(${HERO_BG_URL})` }} />
    <div className="intro-bg-overlay" />
    <div className="intro-bg-shapes">
      <motion.div className="shape shape1" animate={{ y: [0, 30, 0] }} transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }} />
      <motion.div className="shape shape2" animate={{ x: [0, -40, 0] }} transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }} />
      <motion.div className="shape shape3" animate={{ y: [0, -20, 0] }} transition={{ repeat: Infinity, duration: 7, ease: "easeInOut" }} />
    </div>
    <div className="intro-content">
      <h1 className="intro-title">
        <span>Welcome to</span> <span className="brand">EduVerse</span>
      </h1>
      <motion.p className="intro-desc" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 1 }}>
        The next generation platform for modern, interactive, and community-driven learning.
      </motion.p>
      <motion.button 
        className="hero-cta-button" 
        onClick={onCtaClick} 
        style={{ fontSize: '1.5rem', padding: '1.5rem 4rem', borderRadius: 50, fontWeight: 800, marginBottom: '2rem' }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 1 }}
      >
        {isLoggedIn ? 'Go to Dashboard' : 'Start Learning Now'}
      </motion.button>
      <motion.div className="scroll-down-indicator" initial={{ opacity: 0 }} animate={{ opacity: 1, y: [0, 10, 0] }} transition={{ delay: 1, duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
        <span>Scroll Down</span>
        <svg width="24" height="24" fill="none"><path d="M12 5v14m0 0l-6-6m6 6l6-6" stroke="#bfae9e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </motion.div>
    </div>
  </section>
);

// --- Animated Number (for stats) ---
const AnimatedNumber = ({ value, duration = 1.2 }) => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.5 });
  const [display, setDisplay] = React.useState(0);
  React.useEffect(() => {
    if (inView) {
      let start = 0;
      const end = value;
      const step = Math.ceil(end / (60 * duration));
      let current = start;
      const interval = setInterval(() => {
        current += step;
        if (current >= end) {
          setDisplay(end);
          clearInterval(interval);
      } else {
          setDisplay(current);
        }
      }, 1000 / 60);
      return () => clearInterval(interval);
    }
  }, [inView, value, duration]);
  return <span ref={ref}>{display.toLocaleString()}</span>;
};

// --- Animated Grade (for A+ stat) ---
const AnimatedGrade = ({ grades = ['D', 'C', 'B', 'A', 'A+'], duration = 1.2 }) => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.5 });
  const [index, setIndex] = React.useState(0);
  React.useEffect(() => {
    if (inView) {
      let current = 0;
      const interval = setInterval(() => {
        current += 1;
        if (current >= grades.length) {
          setIndex(grades.length - 1);
          clearInterval(interval);
        } else {
          setIndex(current);
        }
      }, (duration * 1000) / (grades.length - 1));
      return () => clearInterval(interval);
    }
  }, [inView, grades, duration]);
  return <span ref={ref}>{grades[index]}</span>;
};

// --- Feature Icons ---
const featureIcons = {
  courses: () => <FaChalkboardTeacher size={38} color="#a68a6d" />,
  community: () => <FaUsers size={38} color="#a68a6d" />,
  progress: () => <FaChartLine size={38} color="#a68a6d" />,
  ai: () => <FaRobot size={38} color="#a68a6d" />,
  support: () => <FaHeadset size={38} color="#a68a6d" />,
};

// --- Expanded Features Data ---
const features = [
  {
    key: "courses",
    title: "Interactive Courses",
    desc: "Engage with hands-on content, quizzes, and real-world projects. Personalized learning paths and real-time feedback.",
    more: "Our courses are immersive, practical, and designed for real-world skills. Unlock a rich library of topics, track your progress, and learn at your own pace. Enjoy interactive video lessons, coding sandboxes, and real project assignments. Get instant feedback and see your growth with every lesson.",
    cta: "Go to Courses",
    route: "/homevideo",
    img: "https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=800&q=80",
    icon: "courses"
  },
  {
    key: "community",
    title: "Vibrant Community",
    desc: "Connect, collaborate, and grow with learners and mentors worldwide. Participate in events, challenges, and group projects. Join discussions, ask questions, and share your progress with a supportive community. Our forums and chat rooms are always buzzing with activity. Take part in live events, group projects, and mentorship programs to accelerate your learning.",
    more: "Our community is the heart of EduVerse. Engage in group projects, live events, and mentorship programs. Share your progress, ask questions, and get support from peers and mentors. Experience a truly collaborative learning environment.",
    cta: "Join the Community",
    route: "/community",
    img: require('../assets/communtiy.png'),
    icon: "community"
  },
  {
    key: "progress",
    title: "Progress Tracking",
    desc: "Visualize your journey, earn badges, and celebrate your achievements. Personalized recommendations keep you motivated.",
    more: "Track your learning milestones, unlock achievements, and get personalized recommendations to keep you on track and inspired. Earn badges, certificates, and see your stats grow in real time.",
    cta: "Go to Profile",
    route: "/profile",
    img: require('../assets/Progress.png'),
    icon: "progress"
  },
  {
    key: "ai",
    title: "AI-Powered Help",
    desc: "Get instant answers, explanations, and guidance from our AI tutor. Available 24/7 to support your learning journey.",
    more: "Our AI assistant is always ready to help you with questions, explanations, and personalized study tips. Learning has never been this smart. Try our AI-powered code review, instant Q&A, and smart recommendations.",
    cta: "Chat with EduBot",
    route: "/chat",
    img: require('../assets/Ai.png'),
    icon: "ai"
  },
  {
    key: "support",
    title: "Dedicated Support",
    desc: "Our team is here to help you succeed. Reach out anytime for technical or academic support.",
    more: "We offer live chat, email, and phone support. Your success is our mission, and we’re always here to help. Access our knowledge base, get help from real people, and never feel stuck again.",
    cta: "Contact Support",
    route: "/support",
    img: require('../assets/contact.png'),
    icon: "support"
  }
];

// --- Hero Section ---
const HeroSection = ({ onCtaClick, isLoggedIn }) => (
  <section className="hero-section" style={{ minHeight: '110vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', padding: '0 0 0 0', backgroundImage: "url('https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=1200&q=80')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
    {/* Blurred overlay */}
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backdropFilter: 'blur(8px)', background: 'rgba(44,34,24,0.18)', zIndex: 1 }} />
    <motion.div className="hero-bg-shape shape-1" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 1.5, type: 'spring' }} />
    <motion.div className="hero-bg-shape shape-2" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 1.5, type: 'spring', delay: 0.2 }} />
    <motion.div
      className="hero-content"
      style={{
        position: 'relative',
        zIndex: 2,
        maxWidth: 1000,
        margin: '0 auto',
        textAlign: 'center',
        padding: '6rem 2rem 6rem 2rem',
        background: 'rgba(44,34,24,0.18)',
        borderRadius: 40,
        boxShadow: '0 12px 48px rgba(44,34,24,0.10)'
      }}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h1
        className="hero-title"
        style={{ fontSize: '5.2rem', fontWeight: 900, color: '#fff8f0', marginBottom: 32, letterSpacing: -2, lineHeight: 1.08, textShadow: '0 6px 32px rgba(44,34,24,0.32), 0 2px 0 #bfae9e, 0 0 8px #0008' }}
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
      >
        <span>Welcome to</span> <span className="brand">EduVerse</span>
      </motion.h1>
      <motion.p className="hero-subtitle" variants={itemVariants} style={{ fontSize: '2.1rem', color: '#fff8f0', maxWidth: 900, margin: '0 auto 48px auto', textShadow: '0 2px 8px rgba(44,34,24,0.18)' }}>
        The next generation platform for modern, interactive, and community-driven learning.
      </motion.p>
      <motion.div variants={itemVariants}>
        <button className="hero-cta-button" onClick={onCtaClick} style={{ fontSize: '1.5rem', padding: '1.5rem 4rem', borderRadius: 50, fontWeight: 800 }}>
          {isLoggedIn ? 'Go to Dashboard' : 'Start Learning Now'}
        </button>
      </motion.div>
    </motion.div>
    <motion.div className="scroll-indicator" initial={{opacity: 0}} animate={{opacity: 1}} transition={{delay: 1.5, duration: 1}} style={{ position: 'absolute', bottom: 48, left: '50%', transform: 'translateX(-50%)' }}>
        <span>Scroll Down</span>
        <FaFeatherAlt />
    </motion.div>
  </section>
);

// --- FeatureCard with matching border radius ---
const FeatureCard = ({ feature, expanded, onExpand, onClose, onGo, isLoggedIn, index }) => {
  const borderRadius = 40;
  const isEven = index % 2 === 0;
  
  return (
    <motion.section
      className={`feature-block${expanded ? " expanded" : ""}`}
      initial={{ opacity: 0, x: isEven ? -120 : 120, scale: 0.92 }}
      whileInView={{ opacity: 1, x: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.35, type: 'spring', stiffness: 60 }}
      whileHover={{ scale: 1.03, boxShadow: '0 28px 80px rgba(191, 174, 158, 0.25)', transition: { duration: 0.15 } }}
    >
      {/* Animated background gradient */}
      <motion.div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `linear-gradient(45deg, 
            rgba(191,174,158,0.1) 0%, 
            rgba(166,138,109,0.05) 50%, 
            rgba(230,211,179,0.1) 100%)`,
          opacity: 0,
        }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />
      
      <div className="feature-block-content">
        <div className="feature-block-img-wrap">
          <motion.div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(45deg, rgba(255,255,255,0.2) 0%, transparent 50%, rgba(255,255,255,0.1) 100%)',
            }}
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
          <img src={feature.img} alt={feature.title} className="feature-block-img" />
        </div>
        <div className="feature-block-text">
          <motion.div 
            className="feature-block-icon"
            whileHover={{ rotate: 360, scale: 1.1 }}
            transition={{ duration: 0.6 }}
          >
            {featureIcons[feature.icon]()}
          </motion.div>
          <h2 style={{ 
            background: 'linear-gradient(135deg, #a68a6d 0%, #bfae9e 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>{feature.title}</h2>
          <p>{feature.desc}</p>
          <AnimatePresence>
            {expanded && (
              <motion.div 
                className="feature-block-more" 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: 20 }} 
                transition={{ duration: 0.3 }}
              >
                <button className="feature-block-close" onClick={onClose} aria-label="Close">&times;</button>
                <p>{feature.more}</p>
                <motion.button 
                  className="feature-cta-btn" 
                  whileHover={{ scale: 1.08, boxShadow: '0 8px 25px rgba(191, 174, 158, 0.3)' }} 
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onGo(feature)}
                  style={{
                    background: 'linear-gradient(135deg, #bfae9e 0%, #a68a6d 100%)',
                    border: 'none',
                    borderRadius: 12,
                    padding: '12px 28px',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '1rem',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 15px rgba(191, 174, 158, 0.2)'
                  }}
                >
                  {feature.cta}
                </motion.button>
                <motion.button 
                  className="read-more-btn" 
                  whileHover={{ scale: 1.05, transition: { duration: 0.12 } }}
                  whileTap={{ scale: 0.95, transition: { duration: 0.10 } }}
                  onClick={onClose} 
                  style={{ marginTop: 8, color: '#a68a6d', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  Read Less
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
          {!expanded && (
            <motion.button 
              className="read-more-btn" 
              whileHover={{ scale: 1.05, boxShadow: '0 6px 20px rgba(191, 174, 158, 0.25)', transition: { duration: 0.12 } }}
              whileTap={{ scale: 0.95, transition: { duration: 0.10 } }}
              onClick={() => onExpand(feature.key)}
              style={{
                background: 'linear-gradient(135deg, #bfae9e 0%, #a68a6d 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: 10,
                padding: '10px 24px',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(191, 174, 158, 0.2)'
              }}
            >
              Read More
            </motion.button>
          )}
        </div>
      </div>
    </motion.section>
  );
};

// --- Section size increase for features/why choose ---
const FeaturesBlocksSection = ({ expandedKey, setExpandedKey, onGoFeature, isLoggedIn }) => (
  <div className="features-blocks-section" style={{
    width: '100vw',
    maxWidth: '100vw',
    margin: 0,
    gap: 96,
    padding: '160px 0 100px 0',
    background: 'linear-gradient(180deg, #fff8f0 0%, #f7f3ef 100%)',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minHeight: '80vh',
  }}>
    {/* Animated background elements */}
    <motion.div
      style={{
        position: 'absolute',
        top: '10%',
        left: '5%',
        width: 200,
        height: 200,
        background: 'radial-gradient(circle, rgba(191,174,158,0.1) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(20px)'
      }}
      animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
    />
    <motion.div
      style={{
        position: 'absolute',
        bottom: '20%',
        right: '10%',
        width: 150,
        height: 150,
        background: 'radial-gradient(circle, rgba(166,138,109,0.1) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(15px)'
      }}
      animate={{ scale: [1.2, 1, 1.2], opacity: [0.4, 0.7, 0.4] }}
      transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
    />
    
    {features.map((f, index) => (
      <FeatureCard
        key={f.key}
        feature={f}
        index={index}
        expanded={expandedKey === f.key}
        onExpand={setExpandedKey}
        onClose={() => setExpandedKey(null)}
        onGo={onGoFeature}
        isLoggedIn={isLoggedIn}
      />
    ))}
  </div>
);

const WhyEduVerseBlock = () => (
  <section className="why-eduverse-block" style={{ 
    padding: '120px 0 60px 0',
    background: 'linear-gradient(180deg, #f7f3ef 0%, #e6d3b3 100%)',
    position: 'relative',
    overflow: 'hidden'
  }}>
    {/* Animated background elements */}
    <motion.div
      style={{
        position: 'absolute',
        top: '20%',
        right: '15%',
        width: 300,
        height: 300,
        background: 'radial-gradient(circle, rgba(191,174,158,0.08) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(25px)'
      }}
      animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.5, 0.2] }}
      transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
    />
    
    <motion.h2 
      initial={{ opacity: 0, y: 40 }} 
      whileInView={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.8, type: 'spring' }}
      style={{
        fontSize: '3.5rem',
        fontWeight: 800,
        background: 'linear-gradient(135deg, #6B4F4B 0%, #a68a6d 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        textAlign: 'center',
        marginBottom: 60,
        textShadow: '0 4px 20px rgba(107,79,75,0.1)'
      }}
    >
      Why Choose EduVerse?
    </motion.h2>
    <div className="why-eduverse-stats" style={{ display: 'flex', justifyContent: 'center', gap: 48, flexWrap: 'wrap' }}>
      {[
        { value: '100%', label: "Trusted Content", suffix: "" },
        { value: "A+", label: "Quality Standards", suffix: "" },
        { value: "24/7", label: "AI Support", suffix: "" },
        { value: 99, label: "Satisfaction", suffix: "%" }
      ].map((stat, i) => (
        <motion.div
          className="stat"
          key={i}
          initial={{ opacity: 0, x: i % 2 === 0 ? -80 : 80, scale: 0.8 }}
          whileInView={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.1 * i, type: 'spring', stiffness: 60 }}
          whileHover={{ 
            scale: 1.1, 
            boxShadow: '0 15px 40px rgba(191, 174, 158, 0.25)',
            y: -10
          }}
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,248,240,0.98) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: 24,
            padding: '32px 24px',
            textAlign: 'center',
            minWidth: 200,
            position: 'relative',
            overflow: 'hidden',
            cursor: 'pointer'
          }}
        >
          {/* Animated background gradient */}
          <motion.div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `linear-gradient(45deg, 
                rgba(191,174,158,0.1) 0%, 
                rgba(166,138,109,0.05) 50%, 
                rgba(230,211,179,0.1) 100%)`,
              opacity: 0,
            }}
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          />
          
          <div style={{ position: 'relative', zIndex: 2 }}>
            <span className="stat-number" style={{
              display: 'block',
              fontSize: '2.1rem',
              fontWeight: 900,
              background: 'linear-gradient(135deg, #a68a6d 0%, #bfae9e 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              marginBottom: 8
            }}>
              {(() => {
                if (stat.label === 'Trusted Content') {
                  return <><AnimatedNumber value={100} duration={1.2} />%</>;
                } else if (stat.label === 'Quality Standards') {
                  return <AnimatedGrade grades={['D', 'C', 'B', 'A', 'A+']} duration={1.2} />;
                } else if (typeof stat.value === 'number') {
                  return <AnimatedNumber value={stat.value} duration={1.2} />;
                } else {
                  return stat.value;
                }
              })()}
              {stat.suffix}
            </span>
            <span className="stat-label" style={{
              fontSize: '1.1rem',
              fontWeight: 600,
              color: '#7a6a6d',
              display: 'block'
            }}>
              {stat.label}
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  </section>
);

// --- How It Works Stepper ---
const steps = [
  { icon: () => <FaCheckCircle color="#a68a6d" size={28} />, title: "Sign Up", desc: "Create your free EduVerse account in seconds." },
  { icon: () => <FaChalkboardTeacher color="#a68a6d" size={28} />, title: "Choose a Course", desc: "Browse our library and pick your learning path." },
  { icon: () => <FaUsers color="#a68a6d" size={28} />, title: "Join the Community", desc: "Connect with peers, mentors, and join discussions." },
  { icon: () => <FaChartLine color="#a68a6d" size={28} />, title: "Track Progress", desc: "Earn badges, certificates, and celebrate your growth." }
];
const HowItWorksSection = () => (
  <section className="how-it-works-section">
    <motion.h2 initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>How EduVerse Works</motion.h2>
    <div className="how-it-works-stepper">
      {steps.map((s, i) => (
        <motion.div 
          className="how-step" 
          key={i} 
          initial={{ opacity: 0, y: 40 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          whileHover={{ scale: 1.1, boxShadow: '0 15px 40px rgba(191, 174, 158, 0.25)', y: -10 }}
          transition={{ duration: 0.7, delay: 0.1 * i, type: 'spring', stiffness: 60 }}
          style={{ cursor: 'pointer', borderRadius: 24, background: '#fff8f0', transition: 'box-shadow 0.3s, transform 0.3s' }}
        >
          <div className="how-step-icon">{s.icon()}</div>
          <div className="how-step-title">{s.title}</div>
          <div className="how-step-desc">{s.desc}</div>
        </motion.div>
      ))}
    </div>
  </section>
);

// --- Developers Team Section ---
const TeamSection = () => (
  <section className="team-section">
    <motion.h2 initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>Meet the Developers</motion.h2>
    <div className="team-grid">
      <motion.div className="team-card" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}>
        <div className="avatar-placeholder" style={{ width: 96, height: 96, borderRadius: '50%', overflow: 'hidden', margin: '0 auto 16px auto', background: '#eee' }}>
          <img src={require('../assets/B97A1367.JPG')} alt="Baraa Al-Shammaa" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 10%' }} />
        </div>
        <h4>Baraa Al-Shammaa</h4>
        <p>Full Stack Developer</p>
      </motion.div>
      <motion.div className="team-card" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}>
        <div className="avatar-placeholder" style={{ width: 96, height: 96, borderRadius: '50%', overflow: 'hidden', margin: '0 auto 16px auto', background: '#eee' }}>
          <img src={require('../assets/abd.jpg')} alt="Abd Al-rhman Al-Tubaji" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <h4>Abd Al-rhman Al-Tubaji</h4>
        <p>Full Stack Developer</p>
      </motion.div>
    </div>
  </section>
);

// --- CTA Section ---
const CTASection = ({ onRegister }) => (
  <section className="cta-modern-glass">
    <div className="cta-bg-shapes">
      <motion.div className="cta-shape cta-shape1" animate={{ y: [0, 30, 0] }} transition={{ repeat: Infinity, duration: 7, ease: "easeInOut" }} />
      <motion.div className="cta-shape cta-shape2" animate={{ x: [0, -40, 0] }} transition={{ repeat: Infinity, duration: 9, ease: "easeInOut" }} />
      <motion.div className="cta-shape cta-shape3" animate={{ y: [0, -20, 0] }} transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }} />
    </div>
    <motion.h2 initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
      Ready to start your journey?
    </motion.h2>
    <motion.p className="cta-subheading" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.7 }}>
      Join EduVerse and unlock your full learning potential with modern, interactive courses and a vibrant community.
    </motion.p>
    <motion.button 
      className="hero-cta-button" 
      whileHover={{ scale: 1.08, background: "linear-gradient(90deg, #bfae9e 0%, #a68a6d 100%)" }}
      whileTap={{ scale: 0.97 }}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      onClick={onRegister}
    >
      Join EduVerse Now
    </motion.button>
  </section>
);

// --- Modern Footer Section ---
const Footer = () => (
  <footer className="homepage-footer-modern-glass">
    <div className="footer-content-glass" style={{ padding: '28px 16px 8px 16px', gap: 18 }}>
      <div className="footer-brand-col" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <img src={eduverseLogo} alt="EduVerse Logo" style={{ height: 72, width: 'auto', marginBottom: 10, display: 'block' }} />
        <div className="footer-mission" style={{ fontSize: '0.98rem', textAlign: 'center', maxWidth: 320 }}>
          Empowering learners worldwide with trusted, interactive education.
        </div>
      </div>
      <div className="footer-links-col" style={{ minWidth: 120 }}>
        <div className="footer-links-title">Links</div>
        <ul className="footer-links-list">
          <li><a href="#">Home</a></li>
          <li><a href="#">Courses</a></li>
          <li><a href="#">About</a></li>
          <li><a href="#">Contact</a></li>
        </ul>
      </div>
      <div className="footer-contact-col">
        <div className="footer-links-title">Contact</div>
        <div className="footer-contact-item"><FaEnvelope /> ba.eduverse@gmail.com</div>
        <div className="footer-contact-item"><FaPhone /> +963 982 068 157</div>
        <div className="footer-contact-item"><FaWhatsapp /> +963 932 912 082</div>
        <div className="footer-socials">
          <a href="https://www.facebook.com/share/1GJ34zK4pW/" target="_blank" rel="noopener noreferrer"><FaFacebook /></a>
          <a href="https://www.instagram.com/baraa_shammaa?igsh=Mm84MWt1NmJ4bGEz" target="_blank" rel="noopener noreferrer"><FaInstagram /></a>
          <a href="#" title="X (Twitter)"><SiX /></a>
          <a href="#" title="LinkedIn: Baraa Shammaa"><FaLinkedin /></a>
        </div>
      </div>
      <div className="footer-policy-col">
        <a href="#" title="Privacy Policy (coming soon)">Privacy Policy</a>
        <a href="#" title="Terms of Service (coming soon)">Terms of Service</a>
      </div>
    </div>
    <div className="footer-copy-glass">
      © {new Date().getFullYear()} EduVerse. All rights reserved.
    </div>
  </footer>
);

// --- Main Homepage Component ---
const Homepage = ({ formType, setFormType, isLoggedIn }) => {
  const [expandedKey, setExpandedKey] = useState(null);
  const [pendingRoute, setPendingRoute] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const scrollRef = useRef(0);
  const rootRef = useRef(null);
  const overlayCloseRef = useRef(false);

  // Toggle logic for login/register buttons
  const handleSetFormType = (type) => {
    if (formType === type) {
      setFormType(null); // Toggle off if already open
    } else {
      setFormType(type);
    }
  };

  const handleGoFeature = (feature) => {
    if (!isLoggedIn) {
      setFormType("login");
      setPendingRoute(feature.route);
    } else {
      window.location.href = feature.route;
    }
  };
  const handleLogin = async (form) => {
    // This is handled by SplitAuthModal internally
    // No need to implement here
  };
  const handleRegister = async (form) => {
    // This is handled by SplitAuthModal internally
    // No need to implement here
  };
  const handleCloseModal = () => {
    setFormType(null);
    setAuthError("");
    setAuthLoading(false);
    window.scrollTo({ top: scrollRef.current, behavior: 'smooth' });
  };
  const handleSwitchMode = () => {
    setAuthError("");
    setAuthLoading(false);
    setFormType(formType === "login" ? "register" : "login");
  };

  // Overlay click: always scroll to top and close modal
  const handleOverlayClick = () => {
    const root = rootRef.current;
    overlayCloseRef.current = true;
    setFormType(null);
    setAuthError("");
    setAuthLoading(false);
    if (root) {
      root.style.position = '';
      root.style.top = '';
      root.style.width = '';
    }
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 10);
  };

  // Redirect to dashboard if user is already logged in
  useEffect(() => {
    if (isLoggedIn && !formType) {
      window.location.href = '/dashboard';
    }
  }, [isLoggedIn, formType]);

  // ESC key closes modal
  useEffect(() => {
    const handleEsc = (e) => {
      if ((formType === 'login' || formType === 'register') && e.key === 'Escape') {
        setFormType(null);
        setAuthError("");
        setAuthLoading(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [formType]);

  // Split logic
  const showSplit = formType === "login" || formType === "register";
  const isLogin = formType === "login";
  const isRegister = formType === "register";

  // Animation for homepage and form halves
  const homepageAnim = showSplit
    ? {
        width: '50vw',
        x: isLogin ? '50vw' : '0vw',
        transition: { type: 'spring', stiffness: 180, damping: 22 }
      }
    : { width: '100vw', x: 0, transition: { type: 'spring', stiffness: 180, damping: 22 } };
  const formAnim = showSplit
    ? {
        width: '50vw',
        x: isLogin ? '-50vw' : '0vw',
        transition: { type: 'spring', stiffness: 180, damping: 22 }
      }
    : { width: 0, x: 0, transition: { type: 'spring', stiffness: 180, damping: 22 } };

  // Save scroll position when opening modal, freeze scroll. Restore on close unless overlayCloseRef is set.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (formType === 'login' || formType === 'register') {
      scrollRef.current = window.scrollY;
      root.style.position = 'fixed';
      root.style.top = `-${scrollRef.current}px`;
      root.style.width = '100vw';
    } else {
      root.style.position = '';
      root.style.top = '';
      root.style.width = '';
      if (!overlayCloseRef.current) {
        window.scrollTo(0, scrollRef.current);
      }
      overlayCloseRef.current = false;
    }
    return () => {
      if (root) {
        root.style.position = '';
        root.style.top = '';
        root.style.width = '';
      }
    };
  }, [formType]);

  return (
    <div ref={rootRef} className="homepage-root" style={{ position: 'relative', overflow: 'hidden', minHeight: '100vh', height: '100vh', background: 'transparent' }}>
      {/* Premium blurred glass divider in the center */}
      {showSplit && (
        <div
          className="split-auth-modal-glass-divider"
          style={{
            position: 'fixed',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '18px',
            height: '100vh',
            background: 'rgba(255,255,255,0.18)',
            borderRadius: '16px',
            boxShadow: '0 0 32px 0 rgba(191, 174, 158, 0.18), 0 0 0 1.5px rgba(255,255,255,0.25) inset',
            backdropFilter: 'blur(18px) saturate(180%)',
            WebkitBackdropFilter: 'blur(18px) saturate(180%)',
            zIndex: 100,
            pointerEvents: 'none',
            border: '1.5px solid rgba(255,255,255,0.32)',
          }}
        />
      )}
      <div
        className={`homepage-split-flex${showSplit ? ' split-active' : ''}`}
        style={{
          display: 'flex',
          flexDirection: 'row',
          width: '100vw',
          height: '100vh',
          overflowY: 'scroll',
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
          transition: 'all 0.5s cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        {/* Homepage half */}
        <motion.div
          className={`homepage-split-half homepage-split-home${showSplit ? ' homepage-blur' : ''}`}
          style={{
            minWidth: 0,
            height: '100vh',
            overflowY: showSplit ? 'hidden' : 'scroll',
            background: 'transparent',
            position: 'relative',
            zIndex: 2,
            display: 'flex',
            alignItems: 'stretch',
            justifyContent: 'stretch',
            filter: showSplit ? 'blur(4px) brightness(0.92)' : 'none',
            pointerEvents: showSplit ? 'auto' : 'auto',
          }}
          animate={showSplit ? { width: '50vw', x: isLogin ? '50vw' : '0vw' } : { width: '100vw', x: 0 }}
          transition={{ type: 'spring', stiffness: 180, damping: 22 }}
        >
          {/* Overlay to close modal on click in split mode */}
          {showSplit && (
            <div
              className="homepage-split-overlay"
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 10, cursor: 'pointer', background: 'rgba(0,0,0,0.01)' }}
              onClick={handleOverlayClick}
            />
          )}
          <div style={{ width: '100%', height: '100%' }}>
            <AnimatedIntro isLoggedIn={isLoggedIn} onCtaClick={() => handleGoFeature({ route: "/dashboard" })} />
            <FeaturesBlocksSection expandedKey={expandedKey} setExpandedKey={setExpandedKey} onGoFeature={handleGoFeature} isLoggedIn={isLoggedIn} />
            <WhyEduVerseBlock />
            <HowItWorksSection />
            <TeamSection />
            <CTASection onRegister={() => handleSetFormType('register')} />
            <Footer />
          </div>
        </motion.div>
        {/* Form half (only ever renders SplitAuthModal) */}
        <motion.div
          className="homepage-split-half homepage-split-form"
          style={{
            minWidth: 0,
            height: '100vh',
            overflowY: 'scroll',
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': { display: 'none' },
            background: 'transparent',
            position: 'relative',
            zIndex: 2,
            display: showSplit ? 'flex' : 'none',
            alignItems: 'stretch',
            justifyContent: 'stretch',
          }}
          animate={showSplit ? { width: '50vw', x: isLogin ? '-50vw' : '0vw' } : { width: 0, x: 0 }}
          transition={{ type: 'spring', stiffness: 180, damping: 22 }}
        >
          {showSplit && (
            <SplitAuthModal
              mode={formType}
              onClose={handleCloseModal}
              onSwitchMode={handleSwitchMode}
              // No need to pass onSubmit, SplitAuthModal handles API logic internally
              isLoading={authLoading}
              errorMessage={authError}
              hideCloseButton={true}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Homepage;
