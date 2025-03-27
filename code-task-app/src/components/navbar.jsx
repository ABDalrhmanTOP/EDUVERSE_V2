import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/Navbar.css";
import { FaUserCircle } from "react-icons/fa";
import eduverseLogo from "../assets/eduverse_logo.png";


const Navbar = ({ onNavigate, isFormOpen }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [activeForm, setActiveForm] = useState(null);
  const navigate = useNavigate();

  // Since AuthContext provides "user", extract username and role
  const username = user ? (user.username || user.name || "User") : "";
  const userRole = user ? user.role : null;

  // Toggle side register form for EduBot
  const handleEduBot = () => {
    if (!isAuthenticated) {
      if (activeForm === "register") {
        setActiveForm(null);
        onNavigate(null);
        navigate("/");
      } else {
        setActiveForm("register");
        onNavigate("register");
      }
    } else {
      navigate("/chat");
    }
  };

  // Toggle side register form for Courses
  const handleHomeVideo = () => {
    if (!isAuthenticated) {
      if (activeForm === "register") {
        setActiveForm(null);
        onNavigate(null);
        navigate("/");
      } else {
        setActiveForm("register");
        onNavigate("register");
      }
    } else {
      navigate("/homevideo");
    }
  };

  // Toggle Login/Register side form when the corresponding button is clicked
  const handleAuthButtonClick = (formType) => {
    if (activeForm === formType) {
      setActiveForm(null);
      onNavigate(null);
      navigate("/");
    } else {
      setActiveForm(formType);
      onNavigate(formType);
    }
  };

  // When the logo is clicked, close any open form and navigate home
  const handleLogoClick = () => {
    setActiveForm(null);
    onNavigate(null);
    navigate("/");
  };

  // Toggle the profile dropdown menu
  const toggleProfileMenu = () => {
    setShowProfileMenu((prev) => !prev);
  };

  // Logout handler: call the context's logout, hide menu, and navigate home
  const handleLogout = () => {
    logout();
    setShowProfileMenu(false);
    navigate("/");
  };

  const navbarClasses = [
    "navbar",
    "nav_container",
    isFormOpen ? "navbar-transparent" : "",
  ].join(" ");

  // If user is admin, clicking shows the dashboard
  const handleDashboard = () => {
    navigate("/AdminDashboard");
  };

  return (
    <nav className={navbarClasses}>
      {/* Left Section: Logo, Courses, EduBot, and Admin (if applicable) */}
      <div className="navbar-left">
        <img
          src={eduverseLogo}
          alt="Eduverse"
          className="navbar-logo"
          onClick={handleLogoClick}
        />
        <button className="nav-link custom-link" onClick={handleHomeVideo}>
          Courses
        </button>
        <button className="nav-link custom-link" onClick={handleEduBot}>
          EduBot
        </button>
        {isAuthenticated && userRole === "admin" && (
          <button className="nav-link custom-link" onClick={handleDashboard}>
            Admin
          </button>
        )}
      </div>

      {/* Right Section: If authenticated, show username and profile icon; otherwise, Login/Register buttons */}
      <div className="navbar-right">
        {isAuthenticated ? (
          <div className="profile-container">
            {username && <span className="username-display">{username}</span>}
            <div className="profile-icon" onClick={toggleProfileMenu}>
              <FaUserCircle size={32} />
            </div>
            {showProfileMenu && (
              <div className="profile-dropdown">
                <button
                  className="profile-dropdown-link"
                  onClick={() => {
                    navigate("/Profile");
                    setShowProfileMenu(false);
                  }}
                >
                  My Profile
                </button>
                <button
                  className="profile-dropdown-link"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <button
              onClick={() => handleAuthButtonClick("login")}
              className="navbar-btn btn-login"
            >
              Login
            </button>
            <button
              onClick={() => handleAuthButtonClick("register")}
              className="navbar-btn btn-register"
            >
              Register
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
