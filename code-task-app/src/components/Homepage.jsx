import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiBookOpen,
  FiMessageSquare,
  FiTrendingUp,
  FiCpu,
  FiX,
  FiUser
} from "react-icons/fi";
import Navbar from "./Navbar";
import "../styles/Homepage.css";
import { FaPhoneAlt, FaWhatsapp } from "react-icons/fa";

// ------------------------- Login Component -------------------------
const Login = ({ onFinished, onSwitchToRegister, closeForm }) => {
  const { login } = useAuth();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [message, setMessage] = React.useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsLoading(true);
    const success = await login({ email, password });
    setIsLoading(false);
    if (success) {
      if (onFinished) onFinished();
    } else {
      setMessage("Login failed. Check credentials.");
    }
  };

  return (
    <div className="auth-form-container">
      <button onClick={closeForm} className="auth-close-button" aria-label="Close form">
        <FiX />
      </button>
      <h2>Welcome Back</h2>
      <p>Login to access your Eduverse dashboard.</p>
      <form onSubmit={handleLogin} className="auth-form">
        <div className="form-group">
          <label htmlFor="login-email">Email Address</label>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {message && <p className="auth-feedback error">{message}</p>}
        <motion.button
          whileTap={{ scale: 0.95 }}
          type="submit"
          className="auth-submit-button"
          disabled={isLoading}
        >
          {isLoading ? "Authenticating..." : "Login"}
        </motion.button>
      </form>
      <div className="auth-switch">
        <p>
          Don't have an account?{" "}
          <button onClick={onSwitchToRegister} className="auth-switch-button">
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
};

// ------------------------- Register Component -------------------------
const Register = ({ onFinished, onSwitchToLogin, closeForm }) => {
  const { registerUser } = useAuth();
  const [name, setName] = React.useState("");
  const [username, setUsername] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [message, setMessage] = React.useState({ text: "", type: "" });

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });
    if (password !== confirmPassword) {
      setMessage({ text: "Passwords don't match.", type: "error" });
      return;
    }
    if (password.length < 8) {
      setMessage({ text: "Password needs 8+ characters.", type: "error" });
      return;
    }
    setIsLoading(true);
    try {
      const success = await registerUser({
        name,
        username,
        email,
        password,
        password_confirmation: confirmPassword
      });
      setIsLoading(false);
      if (success) {
        setMessage({ text: "Success! Please log in.", type: "success" });
        setTimeout(() => {
          if (onSwitchToLogin) onSwitchToLogin();
        }, 1500);
      } else {
        setMessage({ text: "Registration failed. Try different info.", type: "error" });
      }
    } catch (error) {
      setIsLoading(false);
      console.error("Reg error:", error);
      setMessage({ text: error?.response?.data?.message || "An error occurred.", type: "error" });
    }
  };

  return (
    <div className="auth-form-container">
      <button onClick={closeForm} className="auth-close-button" aria-label="Close form">
        <FiX />
      </button>
      <h2>Create Your Account</h2>
      <p>Start your learning journey with Eduverse.</p>
      <form onSubmit={handleRegister} className="auth-form">
        <div className="form-group">
          <label htmlFor="reg-name">Full Name</label>
          <input
            id="reg-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="reg-username">Username</label>
          <input
            id="reg-username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="reg-email">Email</label>
          <input
            id="reg-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="reg-pass">Password (min 8 chars)</label>
          <input
            id="reg-pass"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="reg-confirm">Confirm Password</label>
          <input
            id="reg-confirm"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        {message.text && <p className={`auth-feedback ${message.type}`}>{message.text}</p>}
        <motion.button
          whileTap={{ scale: 0.95 }}
          type="submit"
          className="auth-submit-button"
          disabled={isLoading}
        >
          {isLoading ? "Creating Account..." : "Register"}
        </motion.button>
      </form>
      <div className="auth-switch">
        <p>
          Already registered?{" "}
          <button onClick={onSwitchToLogin} className="auth-switch-button">
            Login
          </button>
        </p>
      </div>
    </div>
  );
};

// ------------------------- Animation Variants for Main Content -------------------------
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};
const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
};
const textVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};
const buttonVariant = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, delay: 0.4, ease: "easeOut" } }
};

// ------------------------- Animation Variants for the Auth Modal -------------------------
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

// ------------------------- Dashboard Content (Authenticated View) -------------------------
const DashboardContent = ({ user, actions }) => {
  const username = user?.username || "User";
  return (
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
        {[
          {
            icon: FiBookOpen,
            title: "Explore Courses",
            desc: "Find your next subject",
            action: actions.goToVideoPage,
            key: "courses"
          },
          {
            icon: FiMessageSquare,
            title: "Chat with EduBot",
            desc: "Get instant assistance",
            action: actions.goToChatPage,
            key: "chat"
          },
          {
            icon: FiUser,
            title: "Your Profile",
            desc: "Update your details",
            action: actions.goToProfilePage,
            key: "profile"
          },
          ...(user?.role === "admin"
            ? [
                {
                  icon: FiCpu,
                  title: "Admin Panel",
                  desc: "Manage platform",
                  action: actions.goToAdminPage,
                  key: "admin",
                  isAdmin: true
                }
              ]
            : [])
        ].map((item) => (
          <motion.button
            key={item.key}
            onClick={item.action}
            className={`action-card ${item.isAdmin ? "admin" : ""}`}
            variants={itemVariants}
            whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(0,0,0,0.08)" }}
          >
            <span className="action-card-icon">
              <item.icon />
            </span>
            <h3>{item.title}</h3>
            <p>{item.desc}</p>
          </motion.button>
        ))}
      </motion.div>
    </motion.div>
  );
};

// ------------------------- Welcome Content (Unauthenticated View) -------------------------
const WelcomeContent = ({ setFormType }) => (
  <motion.div className="welcome-content-area" variants={containerVariants} initial="hidden" animate="visible">
    {/* Hero Section */}
    <div className="welcome-hero-section">
      <div className="hero-overlay"></div>
      <div className="hero-content">
        <motion.h1 variants={textVariant}>Education for the Future Generation</motion.h1>
        <motion.p variants={textVariant} transition={{ delay: 0.2 }}>
          Personalized learning paths, AI-powered assistance, and a universe of knowledge await.
        </motion.p>
        <motion.button
          onClick={() => setFormType("register")}
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
          {
            icon: FiBookOpen,
            title: "Interactive Courses",
            desc: "Engage deeply with dynamic content."
          },
          {
            icon: FiTrendingUp,
            title: "Personalized Paths",
            desc: "Learn what matters most to you, your way."
          },
          {
            icon: FiMessageSquare,
            title: "Expert Tutors & AI",
            desc: "Get support whenever you need it."
          },
          {
            icon: FiCpu,
            title: "Track Your Growth",
            desc: "See your progress and stay motivated."
          }
        ].map((feature, index) => (
          <motion.div
            key={index}
            className="feature-item"
            variants={itemVariants}
            whileHover={{ y: -8, boxShadow: "0 12px 30px rgba(0,0,0,0.09)" }}
            onClick={() => setFormType("login")}
            style={{ cursor: "pointer" }}  // Added pointer cursor on hover
          >
            <span className="feature-icon"><feature.icon /></span>
            <h3>{feature.title}</h3>
            <p>{feature.desc}</p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  </motion.div>
);


// ------------------------- Main Homepage Component -------------------------
const Homepage = ({ formType, setFormType }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  // Close auth modal if authentication status changes.
  useEffect(() => {
    if (!isAuthenticated) setFormType(null);
  }, [isAuthenticated, setFormType]);

  // Navigation actions (avoid unnecessary rerouting).
  const authActions = {
    goToVideoPage: () => navigate("/homevideo"),
    goToChatPage: () => navigate("/chat"),
    goToProfilePage: () => navigate("/profile"),
    goToAdminPage: () => navigate("/AdminDashboard")
  };

  const handleLogout = async () => {
    await logout();
    if (window.location.pathname !== "/") {
      navigate("/");
    }
  };

  return (
    <div className={`homepage-container ${formType ? "auth-panel-active" : ""}`}>
      <Navbar setFormType={setFormType} />
      <main className="homepage-main-content">
        {/* Wrap main content so that on a fresh load all text animates in */}
        <motion.div
          className="main-content-wrapper"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {isAuthenticated ? (
            <DashboardContent user={user} actions={authActions} />
          ) : (
            <WelcomeContent setFormType={setFormType} />
          )}
        </motion.div>
      </main>

      {/* Authentication Panel (isolated via AnimatePresence) */}
      <AnimatePresence>
        {formType && (
          <>
            <motion.div
              key="auth-overlay"
              className="auth-panel-overlay"
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={() => setFormType(null)}
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

      <footer className="homepage-footer" style={{ textAlign: "center", marginTop: "2rem" }}>
        <p>© {new Date().getFullYear()} EduVerse. All rights reserved.</p>
        <p>
          <FaPhoneAlt style={{ marginRight: "0.5rem" }} />
          Phone: +963 980 609 120
        </p>
        <p>
          <FaWhatsapp style={{ marginRight: "0.5rem" }} />
          WhatsApp: +963 982 068 156
        </p>
      </footer>
    </div>
  );
};

export default Homepage;
