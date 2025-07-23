import React, { useState, useEffect, useRef } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { FiUser, FiLogOut, FiMenu, FiX, FiCreditCard, FiClock } from 'react-icons/fi'; // Example icons
import { FaChevronDown } from 'react-icons/fa';
import "../styles/Navbar.css"; // <-- Use the NEW Navbar.css
import eduverseLogo from "../assets/2.png";
import defaultProfile from "../assets/user.png";
import NotificationDropdown from "./admin/NotificationDropdown";
import apiClient from "../api/axios";
import LanguageSwitcher from './admin/LanguageSwitcher';
import { useTranslation } from 'react-i18next';

const navItemVariants = {
  hidden: { opacity: 0, y: -16 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: 0.07 * i, duration: 0.35, type: 'spring', stiffness: 90 } })
};

const Navbar = ({ setFormType, hideAuthButtons, formType }) => {
  const { t, i18n } = useTranslation();
  const { isAuthenticated, user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // For mobile
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
    if (isAuthenticated) {
      navigate("/dashboard");
    } else {
      navigate("/");
    }
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
     navigate("/");
     setMobileMenuOpen(false);
     if (formType === type) {
       setFormType(null); // Toggle off if already open
     } else {
       setFormType(type);
     }
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
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 120, damping: 18 }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        zIndex: 2000,
        background: 'linear-gradient(120deg, rgba(255,248,240,0.82) 0%, rgba(191,174,158,0.18) 100%)',
        boxShadow: '0 8px 32px 0 rgba(191,174,158,0.10)',
        borderBottom: '1.5px solid rgba(191,174,158,0.10)',
        backdropFilter: 'blur(18px) saturate(180%)',
        WebkitBackdropFilter: 'blur(18px) saturate(180%)',
        borderRadius: '0 0 32px 32px',
        padding: '0',
        minHeight: 64,
        height: 64,
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <div className="navbar-container" style={{ maxWidth: 1300, margin: '0 auto', padding: '0 32px', width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '100%' }}>
        <div className="navbar-left" style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
          <img src={eduverseLogo} alt="Eduverse Logo" className="navbar-logo" style={{ height: 32, width: 'auto', cursor: 'pointer', borderRadius: 0, boxShadow: 'none', display: 'block', margin: '0 auto' }} onClick={handleLogoClick} />
        </div>
        {/* Desktop Nav + Bell */}
        <motion.div
          className="navbar-center"
          style={{
            display: 'flex',
            gap: 32,
            alignItems: 'center',
            flexWrap: 'nowrap',
            minWidth: 0,
            flex: 1,
            justifyContent: 'flex-start',
            marginLeft: i18n.language === 'en' ? '-24px' : '0',
            transition: 'margin 0.2s',
          }}
        >
          {isAuthenticated && (
            <div style={{ fontSize: 28, display: 'flex', alignItems: 'center', marginRight: 12, flexShrink: 0 }}>
              <NotificationDropdown />
            </div>
          )}
          {isAuthenticated && [
            { to: '/homevideo', label: t('navbar.courses') },
            { to: '/chat', label: t('navbar.edubot') },
            { to: '/community', label: t('navbar.community') },
            { to: '/subscription-plans', label: t('navbar.subscribe') },
            ...(user?.role === 'admin' ? [{ to: '/AdminDashboard', label: t('navbar.adminPanel') }] : [])
          ].map((item, i) => (
            <motion.div
              key={item.to}
              custom={i}
              initial="hidden"
              animate="visible"
              variants={navItemVariants}
              style={{ display: 'inline-block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 170 }}
            >
              <NavLink
                to={item.to}
                className={navLinkClass}
                style={{ fontSize: '1.08rem', fontWeight: 600, color: '#7a6a6a', padding: '8px 0', borderRadius: 8, transition: 'background 0.2s, color 0.2s', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 170 }}
              >
                {item.label}
              </NavLink>
            </motion.div>
          ))}
        </motion.div>
        <div className="navbar-right" style={{ display: 'flex', alignItems: 'center', gap: 20, flexShrink: 0 }}>
          {/* Auth/Profile */}
          {!isAuthenticated && !hideAuthButtons && (
            <div className="auth-buttons-desktop" style={{ display: 'flex', gap: 10 }}>
              <motion.button
                whileHover={{ scale: 1.08, background: 'linear-gradient(90deg, #fff8f0 0%, #bfae9e 100%)', color: '#a68a6d' }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleAuthButtonClick('login')}
                className="navbar-button btn-secondary"
                style={{
                  background: 'rgba(255,255,255,0.7)',
                  color: '#a68a6d',
                  border: '1.5px solid #bfae9e',
                  borderRadius: 14,
                  fontWeight: 700,
                  fontSize: '1.08rem',
                  padding: '10px 28px',
                  boxShadow: '0 2px 8px rgba(191,174,158,0.08)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {t('navbar.login')}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.08, background: 'linear-gradient(90deg, #bfae9e 0%, #a68a6d 100%)', color: '#fff' }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleAuthButtonClick('register')}
                className="navbar-button btn-primary"
                style={{
                  background: 'linear-gradient(90deg, #bfae9e 0%, #a68a6d 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 14,
                  fontWeight: 800,
                  fontSize: '1.08rem',
                  padding: '10px 32px',
                  boxShadow: '0 4px 16px rgba(191,174,158,0.12)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {t('navbar.register')}
              </motion.button>
            </div>
          )}
          {isAuthenticated && (
            <>
              <div className="profile-container" ref={profileMenuRef} style={{ position: 'relative' }}>
                <button className="profile-button" onClick={toggleProfileMenu} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  <img src={profileImageUrl} alt="Profile" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', boxShadow: '0 2px 8px rgba(191,174,158,0.10)' }} />
                  <span style={{ fontWeight: 700, color: '#a68a6d', fontSize: '1.08rem' }}>{username}</span>
                  <FaChevronDown style={{ color: '#bfae9e', fontSize: 16, marginLeft: 2 }} />
              </button>
                {showProfileMenu && (
                  <div className="profile-dropdown glassmorphism" style={{ position: 'absolute', top: 48, right: 0, minWidth: 180, background: 'rgba(255,255,255,0.98)', borderRadius: 16, boxShadow: '0 4px 24px rgba(191,174,158,0.14)', zIndex: 100, padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <NavLink to="/dashboard" className="profile-dropdown-link" style={{ padding: 8, borderRadius: 8, color: '#7a6a6a', textDecoration: 'none', fontWeight: 600 }}>{t('navbar.dashboard')}</NavLink>
                    <NavLink to="/profile" className="profile-dropdown-link" style={{ padding: 8, borderRadius: 8, color: '#7a6a6a', textDecoration: 'none', fontWeight: 600 }}>{t('navbar.profile')}</NavLink>
                    <NavLink to="/subscription-history" className="profile-dropdown-link" style={{ padding: 8, borderRadius: 8, color: '#7a6a6a', textDecoration: 'none', fontWeight: 600 }}>{t('navbar.paymentHistory')}</NavLink>
                    <button onClick={handleLogout} className="profile-dropdown-link" style={{ padding: 8, borderRadius: 8, color: '#e53935', background: 'none', border: 'none', fontWeight: 800, textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <FiLogOut style={{ color: '#e53935', fontSize: 20 }} /> {t('navbar.logout')}
                    </button>
                  </div>
                )}
            </div>
            </>
          )}
          {/* LanguageSwitcher at far right with margin */}
          <div style={{ marginLeft: 16, display: 'flex', alignItems: 'center' }}>
            <LanguageSwitcher />
          </div>
          {/* Mobile Menu Button */}
          <button
            className="mobile-menu-toggle burger-only-mobile"
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label="Toggle menu"
            style={{
              background: 'none',
              border: 'none',
              color: '#a68a6d',
              fontSize: 28,
              cursor: 'pointer',
            }}
          >
            {mobileMenuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>
      {/* Mobile Menu */}
            <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="mobile-menu glassy"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 120, damping: 18 }}
            style={{
              position: 'fixed',
              top: 68,
              right: 0,
              width: '80vw',
              maxWidth: 340,
              height: 'calc(100vh - 68px)',
              background: 'linear-gradient(120deg, rgba(255,248,240,0.98) 0%, rgba(191,174,158,0.22) 100%)',
              boxShadow: '-8px 0 32px 0 rgba(191,174,158,0.10)',
              borderRadius: '18px 0 0 18px',
              zIndex: 3000,
              display: 'flex',
              flexDirection: 'column',
              padding: '32px 24px',
              gap: 18,
            }}
          >
            {!isAuthenticated && !hideAuthButtons && (
              <>
                <button onClick={() => handleAuthButtonClick('login')} className="mobile-nav-link" style={{ background: '#fff', color: '#a68a6d', border: '1.5px solid #bfae9e', borderRadius: 12, fontWeight: 700, fontSize: '1.08rem', padding: '12px 0', marginBottom: 10 }}>{t('navbar.login')}</button>
                <button onClick={() => handleAuthButtonClick('register')} className="mobile-nav-link register" style={{ background: 'linear-gradient(90deg, #bfae9e 0%, #a68a6d 100%)', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 800, fontSize: '1.08rem', padding: '12px 0', marginBottom: 18 }}>{t('navbar.register')}</button>
                        </>
                    )}
            {isAuthenticated && [
              { to: '/homevideo', label: t('navbar.courses') },
              { to: '/chat', label: t('navbar.edubot') },
              { to: '/community', label: t('navbar.community') },
              { to: '/subscription-plans', label: t('navbar.subscribe') },
              ...(user?.role === 'admin' ? [{ to: '/AdminDashboard', label: t('navbar.adminPanel') }] : [])
            ].map((item, i) => (
              <NavLink
                key={item.to}
                to={item.to}
                className="mobile-nav-link"
                style={{ fontSize: '1.08rem', fontWeight: 600, color: '#7a6a6a', padding: '12px 0', borderRadius: 8, marginBottom: 8, background: 'none', border: 'none', textAlign: 'left' }}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}
                    </motion.div>
                )}
            </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;