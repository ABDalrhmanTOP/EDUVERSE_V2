// src/components/Navbar.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/Navbar.css";
import eduverseLogo from "../assets/eduverse_logo.png";
import defaultProfile from "../assets/default-profile.png"; // Ensure this file exists

const Navbar = ({ onNavigate, isFormOpen }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [activeForm, setActiveForm] = useState(null);
  const navigate = useNavigate();

  // Extract username and role from user
  const username = user ? (user.username || user.name || "User") : "";
  const userRole = user ? user.role : null;

  // Compute the profile image URL if available
  // (Make sure your backend storage is linked via `php artisan storage:link`)
  let profileImageUrl = defaultProfile;
  if (isAuthenticated && user && user.profile_photo_path) {
    const baseUrl = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";
    profileImageUrl = `${baseUrl}/storage/${user.profile_photo_path}`;
  }

  // Handlers for navigation
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

  const handleLogoClick = () => {
    setActiveForm(null);
    onNavigate(null);
    navigate("/");
  };

  const toggleProfileMenu = () => {
    setShowProfileMenu((prev) => !prev);
  };

  const handleLogout = () => {
    logout();
    setShowProfileMenu(false);
    navigate("/");
  };

  const handleDashboard = () => {
    navigate("/AdminDashboard");
  };

  const navbarClasses = [
    "navbar",
    "nav_container",
    isFormOpen ? "navbar-transparent" : "",
  ].join(" ");

  return (
    <nav className={navbarClasses}>
      {/* Left Section */}
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
      {/* Right Section */}
      <div className="navbar-right">
        {isAuthenticated ? (
          <div className="profile-container">
            {username && <span className="username-display">{username}</span>}
            {/* Instead of the default profile icon, show the user’s profile image */}
            <img
              src={profileImageUrl}
              alt="User Profile"
              className="navbar-profile-picture"
              onClick={() => navigate("/profile")}
            />
            {showProfileMenu && (
              <div className="profile-dropdown">
                <button
                  className="profile-dropdown-link"
                  onClick={() => {
                    navigate("/profile");
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
