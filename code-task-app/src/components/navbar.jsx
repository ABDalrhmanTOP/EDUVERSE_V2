import React, { useState, useEffect, useRef } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { FiUser, FiLogOut, FiMenu, FiX } from 'react-icons/fi'; // Example icons
import "../styles/Navbar.css"; // <-- Use the NEW Navbar.css
import eduverseLogo from "../assets/1.png"; // Make sure path is correct
import defaultProfile from "../assets/user.png";

const Navbar = ({ setFormType }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // For mobile
  const navigate = useNavigate();
  const profileMenuRef = useRef(null);

  // --- Scroll Handling ---
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // --- User Details ---
  const username = user ? user.username || user.name || "User" : "";
  const userRole = user ? user.role : null;
   const profileImageUrl =
    isAuthenticated && user && user.profile_photo_path
      ? `${process.env.REACT_APP_API_BASE_URL || "http://localhost:8000"}/storage/${user.profile_photo_path}`
      : defaultProfile;

  // --- Event Handlers ---
  const handleLogoClick = () => {
    setFormType(null);
    setIsMobileMenuOpen(false); // Close mobile menu
    navigate("/");
  };

  const toggleProfileMenu = () => setShowProfileMenu((prev) => !prev);
  const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev);

  const handleNavLinkClick = (path) => {
      navigate(path);
      setIsMobileMenuOpen(false); // Close mobile menu on navigation
  };

  const handleLogout = () => {
    logout();
    setShowProfileMenu(false);
    setIsMobileMenuOpen(false);
    setFormType(null);
    navigate("/");
  };

  const handleProfileLink = () => {
    navigate("/profile");
    setShowProfileMenu(false);
    setIsMobileMenuOpen(false);
  };

   const handleAuthButtonClick = (type) => {
     setFormType(type);
     setIsMobileMenuOpen(false); // Close mobile menu
  };

  // --- Close dropdown on outside click ---
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
       // Close mobile menu if clicking outside navbar (optional)
       // Add ref to mobile menu container if needed for more specific logic
        if (!event.target.closest('.navbar-main')) {
            setIsMobileMenuOpen(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navLinkClass = ({ isActive }) => (isActive ? "nav-link active" : "nav-link");

  return (
    <motion.nav
      className={`navbar-main ${isScrolled ? "scrolled" : ""}`}
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
    >
      <div className="navbar-container">
        {/* Left: Logo */}
        <div className="navbar-left">
          <img
            src={eduverseLogo}
            alt="Eduverse Logo"
            className="navbar-logo"
            onClick={handleLogoClick}
            title="Go to Homepage"
          />
           {/*<span className="navbar-brand-text" onClick={handleLogoClick}>Eduverse</span>*/}
        </div>

        {/* Center: Desktop Links */}
        <div className="navbar-center">
          {isAuthenticated && (
            <>
              <NavLink to="/homevideo" className={navLinkClass}>Courses</NavLink>
              <NavLink to="/chat" className={navLinkClass}>EduBot</NavLink>
              {userRole === "admin" && (
                 <NavLink to="/AdminDashboard" className={navLinkClass}>Admin Panel</NavLink>
              )}
            </>
          )}
        </div>

        {/* Right: Auth/Profile & Mobile Menu Toggle */}
        <div className="navbar-right">
           {isAuthenticated ? (
             <div className="profile-container" ref={profileMenuRef}>
               <button className="profile-button" onClick={toggleProfileMenu} aria-label="User Menu">
                 <img src={profileImageUrl} alt="Profile" className="navbar-profile-picture" />
                 <span className="profile-username-desktop">{username}</span>
               </button>
                {showProfileMenu && (
                    <motion.div
                        className="profile-dropdown-menu"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }} // Needs AnimatePresence in parent if used
                        transition={{ duration: 0.2 }}
                    >
                        <button className="profile-dropdown-item" onClick={handleProfileLink}>
                            <FiUser className="dropdown-icon" /> My Profile
                        </button>
                        <button className="profile-dropdown-item logout" onClick={handleLogout}>
                            <FiLogOut className="dropdown-icon" /> Logout
                        </button>
                    </motion.div>
                )}
             </div>
           ) : (
             <div className="auth-buttons-desktop">
               <button onClick={() => handleAuthButtonClick("login")} className="navbar-button btn-secondary">Login</button>
               <button onClick={() => handleAuthButtonClick("register")} className="navbar-button btn-primary">Register</button>
             </div>
           )}
           {/* Mobile Menu Button */}
           <button className="mobile-menu-toggle" onClick={toggleMobileMenu} aria-label="Toggle menu">
              {isMobileMenuOpen ? <FiX /> : <FiMenu />}
           </button>
        </div>
      </div>

       {/* Mobile Menu Dropdown */}
       <motion.div
            className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}
            initial={false}
            animate={isMobileMenuOpen ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
        >
            {isAuthenticated ? (
                <>
                    <button onClick={() => handleNavLinkClick('/homevideo')} className="mobile-nav-link">Courses</button>
                    <button onClick={() => handleNavLinkClick('/chat')} className="mobile-nav-link">EduBot</button>
                    {userRole === 'admin' && <button onClick={() => handleNavLinkClick('/AdminDashboard')} className="mobile-nav-link">Admin Panel</button>}
                    <hr className="mobile-menu-divider" />
                     <button onClick={handleProfileLink} className="mobile-nav-link"><FiUser className="dropdown-icon" /> My Profile</button>
                     <button onClick={handleLogout} className="mobile-nav-link logout"><FiLogOut className="dropdown-icon" /> Logout</button>
                </>
            ) : (
                 <>
                    <button onClick={() => handleAuthButtonClick('login')} className="mobile-nav-link">Login</button>
                    <button onClick={() => handleAuthButtonClick('register')} className="mobile-nav-link register">Register</button>
                </>
            )}
       </motion.div>
    </motion.nav>
  );
};

export default Navbar;