import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiBookOpen, FiMessageSquare, FiTrendingUp, FiCpu, FiX, FiUser 
} from 'react-icons/fi';
import Navbar from "./Navbar";
import "../styles/Homepage.css";

const Login = ({ onFinished, onSwitchToRegister, closeForm }) => {
   const { login } = useAuth();
   const [email, setEmail] = useState("");
   const [password, setPassword] = useState("");
   const [isLoading, setIsLoading] = useState(false);
   const [message, setMessage] = useState("");

   const handleLogin = async (e) => {
     e.preventDefault(); setMessage(""); setIsLoading(true);
     const success = await login({ email, password });
     setIsLoading(false);
     if (success) { if (onFinished) onFinished(); }
     else { setMessage("Login failed. Check credentials."); }
   };

  return (
    <div className="auth-form-container">
       <button onClick={closeForm} className="auth-close-button" aria-label="Close form"><FiX /></button>
      <h2>Welcome Back</h2>
      <p>Login to access your Eduverse dashboard.</p>
      <form onSubmit={handleLogin} className="auth-form">
        <div className="form-group">
          <label htmlFor="login-email">Email Address</label>
          <input id="login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="form-group">
          <label htmlFor="login-password">Password</label>
          <input id="login-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        {message && <p className="auth-feedback error">{message}</p>}
        <motion.button whileTap={{ scale: 0.95 }} type="submit" className="auth-submit-button" disabled={isLoading}>
          {isLoading ? "Authenticating..." : "Login"}
        </motion.button>
      </form>
      <div className="auth-switch">
        <p>Don't have an account? <button onClick={onSwitchToRegister} className="auth-switch-button">Sign Up</button></p>
      </div>
    </div>
  );
};

const Register = ({ onFinished, onSwitchToLogin, closeForm }) => {
   const { registerUser } = useAuth();
   const [name, setName] = useState("");
   const [username, setUsername] = useState("");
   const [email, setEmail] = useState("");
   const [password, setPassword] = useState("");
   const [confirmPassword, setConfirmPassword] = useState("");
   const [isLoading, setIsLoading] = useState(false);
   const [message, setMessage] = useState({ text: "", type: "" });

   const handleRegister = async (e) => {
     e.preventDefault(); setMessage({ text: "", type: "" });
     if (password !== confirmPassword) { setMessage({ text: "Passwords don't match.", type: "error" }); return; }
     if (password.length < 8) { setMessage({ text: "Password needs 8+ characters.", type: "error" }); return; }
     setIsLoading(true);
     try {
       const success = await registerUser({ name, username, email, password, password_confirmation: confirmPassword });
       setIsLoading(false);
       if (success) {
         setMessage({ text: "Success! Please log in.", type: "success" });
         setTimeout(() => { if (onSwitchToLogin) onSwitchToLogin(); }, 1500);
       } else { setMessage({ text: "Registration failed. Try different info.", type: "error" }); }
     } catch (error) {
       setIsLoading(false); console.error("Reg error:", error);
       setMessage({ text: error?.response?.data?.message || "An error occurred.", type: "error" });
     }
   };

  return (
    <div className="auth-form-container">
      <button onClick={closeForm} className="auth-close-button" aria-label="Close form"><FiX /></button>
      <h2>Create Your Account</h2>
      <p>Start your learning journey with Eduverse.</p>
      <form onSubmit={handleRegister} className="auth-form">
        <div className="form-group"><label htmlFor="reg-name">Full Name</label><input id="reg-name" type="text" value={name} onChange={(e) => setName(e.target.value)} required /></div>
        <div className="form-group"><label htmlFor="reg-username">Username</label><input id="reg-username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required /></div>
        <div className="form-group"><label htmlFor="reg-email">Email</label><input id="reg-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
        <div className="form-group"><label htmlFor="reg-pass">Password (min 8 chars)</label><input id="reg-pass" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
        <div className="form-group"><label htmlFor="reg-confirm">Confirm Password</label><input id="reg-confirm" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required /></div>
        {message.text && <p className={`auth-feedback ${message.type}`}>{message.text}</p>}
        <motion.button whileTap={{ scale: 0.95 }} type="submit" className="auth-submit-button" disabled={isLoading}>
          {isLoading ? "Creating Account..." : "Register"}
        </motion.button>
      </form>
      <div className="auth-switch">
        <p>Already registered? <button onClick={onSwitchToLogin} className="auth-switch-button">Login</button></p>
      </div>
    </div>
  );
};


// --- Main Homepage Component ---
const Homepage = ({ formType, setFormType }) => { // Receive props from App.js
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const authActions = {
    goToVideoPage: () => navigate("/homevideo"),
    goToChatPage: () => navigate("/chat"),
    goToProfilePage: () => navigate("/profile"),
    goToAdminPage: () => navigate("/AdminDashboard")
  };
  useEffect(() => {
      // If auth state changes (e.g., logout from another tab), close the form
      if (!isAuthenticated) setFormType(null);
  }, [isAuthenticated, setFormType]);

  const handleLogout = async () => { await logout(); navigate("/"); };
  const goToVideoPage = () => navigate("/homevideo");
  const goToChatPage = () => navigate("/chat");
  const goToProfilePage = () => navigate("/profile");
  const goToAdminPage = () => navigate("/AdminDashboard");

  const username = user ? (user.username || user.name || "User") : "User";

  // --- Framer Motion Variants ---
  const containerVariants = {
      hidden: { opacity: 0 },
      visible: {
          opacity: 1,
          transition: { staggerChildren: 0.1, delayChildren: 0.2 }
      }
  };
  const itemVariants = {
      hidden: { y: 20, opacity: 0 },
      visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
  };
   const textVariant = {
     hidden: { opacity: 0, y: 20 },
     visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
   };
   const buttonVariant = {
       hidden: { opacity: 0, scale: 0.8 },
       visible: { opacity: 1, scale: 1, transition: { duration: 0.5, delay: 0.4, ease: "easeOut" } }
   };
    const panelVariants = {
        hidden: { x: "100%", opacity: 0.8 },
        visible: { x: 0, opacity: 1, transition: { type: "tween", duration: 0.4, ease: "easeInOut" } },
        exit: { x: "100%", opacity: 0.8, transition: { type: "tween", duration: 0.3, ease: "easeInOut" } }
    };
    const overlayVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.4 } },
        exit: { opacity: 0, transition: { duration: 0.3 } }
    };


  // --- Content Components ---
  const DashboardContent = () => (
    <motion.div
        className="dashboard-content-area"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
    >
      <motion.div className="dashboard-header-section" variants={itemVariants}>
         <h1>Hello, {username}!</h1>
         <p>Let's continue your learning adventure.</p>
      </motion.div>
      <motion.div className="dashboard-quick-actions" variants={containerVariants}>
            {[ // Array for easier mapping if needed later
                { icon: FiBookOpen, title: "Explore Courses", desc: "Find your next subject", action: goToVideoPage, key: 'courses' },
                { icon: FiMessageSquare, title: "Chat with EduBot", desc: "Get instant assistance", action: goToChatPage, key: 'chat' },
                { icon: FiUser, title: "Your Profile", desc: "Update your details", action: goToProfilePage, key: 'profile' },
                ...(user?.role === 'admin' ? [{ icon: FiCpu, title: "Admin Panel", desc: "Manage platform", action: goToAdminPage, key: 'admin', isAdmin: true }] : [])
            ].map(item => (
                 <motion.button
                    key={item.key}
                    onClick={item.action}
                    className={`action-card ${item.isAdmin ? 'admin' : ''}`}
                    variants={itemVariants}
                    whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(0,0,0,0.08)" }}
                 >
                    <span className="action-card-icon"><item.icon/></span>
                    <h3>{item.title}</h3>
                    <p>{item.desc}</p>
                 </motion.button>
            ))}
        </motion.div>
        {/* Add more dashboard widgets here */}
    </motion.div>
  );

  const WelcomeContent = () => (
    <motion.div
        className="welcome-content-area"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
    >
       {/* Hero Section with Background */}
      <div className="welcome-hero-section">
         <div className="hero-overlay"></div> {/* For darkening/coloring image */}
         <div className="hero-content">
            <motion.h1 variants={textVariant}>Education for the Future Generation</motion.h1>
            <motion.p variants={textVariant} transition={{ delay: 0.2 }}>
               Personalized learning paths, AI-powered assistance, and a universe of knowledge await.
            </motion.p>
            <motion.button
                onClick={() => setFormType('register')}
                className="hero-cta-button"
                variants={buttonVariant}
                whileHover={{ scale: 1.05, boxShadow: "0 6px 25px rgba(200, 159, 156, 0.4)" }}
                whileTap={{ scale: 0.98 }}
            >
              Start Learning Today
            </motion.button>
         </div>
      </div>

      {/* Features Section */}
      <div className="features-section">
        <motion.h2 variants={itemVariants}>Why Learn with Eduverse?</motion.h2>
        <motion.div className="features-grid" variants={containerVariants}>
          {[
              { icon: FiBookOpen, title: "Interactive Courses", desc: "Engage deeply with dynamic content." },
              { icon: FiTrendingUp, title: "Personalized Paths", desc: "Learn what matters most to you, your way." },
              { icon: FiMessageSquare, title: "Expert Tutors & AI", desc: "Get support whenever you need it." },
              { icon: FiCpu, title: "Track Your Growth", desc: "See your progress and stay motivated." }
          ].map((feature, index) => (
              <motion.div
                  key={index}
                  className="feature-item"
                  variants={itemVariants}
                  whileHover={{ y: -8, boxShadow: "0 12px 30px rgba(0,0,0,0.09)" }}
              >
                  <span className="feature-icon"><feature.icon/></span>
                  <h3>{feature.title}</h3>
                  <p>{feature.desc}</p>
              </motion.div>
          ))}
        </motion.div>
      </div>
       {/* Add more sections: Testimonials, Call to Action etc. */}
    </motion.div>
  );

  return (
    <div className={`homepage-container ${formType ? 'auth-panel-active' : ''}`}>
      <Navbar setFormType={setFormType} />

      <main className="homepage-main-content">
        {/* AnimatePresence allows exit animations */}
        <AnimatePresence mode="wait">
          {isAuthenticated ? (
            <DashboardContent user={user} actions={authActions} />
          ) : (
            <WelcomeContent setFormType={setFormType} />
          )}
        </AnimatePresence>
      </main>

       {/* Authentication Panel */}
       <AnimatePresence>
            {formType && ( // Only render when formType is set
                <>
                     <motion.div
                        key="auth-overlay"
                        className="auth-panel-overlay"
                        variants={overlayVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={() => setFormType(null)} // Close on overlay click
                     />
                    <motion.div
                        key="auth-panel"
                        className="auth-panel"
                        variants={panelVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                    >
                        <div className="auth-panel-content">
                            {formType === "login" && (
                                <Login
                                    onFinished={() => setFormType(null)}
                                    onSwitchToRegister={() => setFormType("register")}
                                    closeForm={() => setFormType(null)}
                                />
                            )}
                            {formType === "register" && (
                                <Register
                                    onFinished={() => setFormType(null)}
                                    onSwitchToLogin={() => setFormType("login")}
                                    closeForm={() => setFormType(null)}
                                />
                            )}
                        </div>
                    </motion.div>
                </>
            )}
       </AnimatePresence>

      <footer className="homepage-footer">
        <p>© {new Date().getFullYear()} Eduverse.</p>
        {/* Add footer links: About Us, Contact, Privacy Policy etc. */}
      </footer>
    </div>
  );
};
// Unified Content Components
const DashboardContent = ({ user, actions }) => {
  const username = user?.username || "User";
  
  return (
    <motion.div
      className="dashboard-content"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="dashboard-header">
        <h1>Welcome, {username}</h1>
        <p>Continue your learning journey</p>
      </div>

      <div className="action-grid">
        {[
          { icon: FiBookOpen, label: "Courses", action: actions.goToVideoPage },
          { icon: FiMessageSquare, label: "EduBot", action: actions.goToChatPage },
          { icon: FiUser, label: "Profile", action: actions.goToProfilePage },
          ...(user?.role === 'admin' ? 
            [{ icon: FiCpu, label: "Admin", action: actions.goToAdminPage }] : []
          )
        ].map((item, index) => (
          <motion.button
            key={index}
            className="action-card"
            onClick={item.action}
            whileHover={{ scale: 1.05 }}
          >
            <item.icon className="action-icon" />
            <span>{item.label}</span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

const WelcomeContent = ({ setFormType }) => (
  <motion.div
    className="welcome-content"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <div className="hero-section">
      <h1>Learn Without Limits</h1>
      <p>Start your educational journey today</p>
      <button 
        className="cta-button"
        onClick={() => setFormType('register')}
      >
        Get Started
      </button>
    </div>

    <div className="features-section">
      <h2>Why Choose Us?</h2>
      <div className="feature-grid">
        {[
          { icon: FiBookOpen, title: "Interactive Lessons", text: "Engaging content" },
          { icon: FiTrendingUp, title: "Progress Tracking", text: "Monitor your growth" },
          { icon: FiCpu, title: "AI Support", text: "24/7 assistance" }
        ].map((feature, index) => (
          <div key={index} className="feature-card">
            <feature.icon className="feature-icon" />
            <h3>{feature.title}</h3>
            <p>{feature.text}</p>
          </div>
        ))}
      </div>
    </div>
  </motion.div>
);

export default Homepage;