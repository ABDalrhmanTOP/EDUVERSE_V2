import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/Navbar.css";
import { FaUserCircle } from "react-icons/fa";

const Navbar = ({ onNavigate, isFormOpen }) => {
  const { isAuthenticated, logout } = useAuth();
  const [user, setUser] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [activeForm, setActiveForm] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem("role");
    setUser(role);
  }, []);

  const handleEduBot = () => {
    if (!isAuthenticated) {
      navigate("/login");
    } else {
      navigate("/chat");
    }
  };

  const handleAuthButtonClick = (formType) => {
    if (activeForm === formType) {
      setActiveForm(null);
      onNavigate(null);
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
    localStorage.removeItem("user");
    setShowProfileMenu(false);
    navigate("/");
  };

  const navbarClasses = [
    "navbar",
    "nav_container",
    isFormOpen ? "navbar-transparent" : "",
  ].join(" ");

  const handleDashboard = () => {
    navigate("/AdminDashboard");
  };

  const handleHomeVideo = () => {
    navigate("/homevideo");
  };

  return (
    <nav className={navbarClasses}>
      {/* Left Section: Logo, Courses, EduBot */}
      <div className="navbar-left">
        <img
          src="logo.png"
          alt="Eduverse Logo"
          className="navbar-logo"
          onClick={handleLogoClick}
        />
        <button className="nav-link custom-link" onClick={handleHomeVideo}>
          Courses
        </button>
        <button className="nav-link custom-link" onClick={handleEduBot}>
          EduBot
        </button>
        {user === "admin" && (
          <button className="nav-link custom-link" onClick={handleDashboard}>
            Admin
          </button>
        )}
      </div>

      {/* Right Section: Profile and Auth Buttons */}
      <div className="navbar-right">
        {isAuthenticated ? (
          <div className="profile-container">
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
                <button className="profile-dropdown-link" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <button
              onClick={() => handleAuthButtonClick("login")}
              className="btn btn-login"
            >
              Login
            </button>
            <button
              onClick={() => handleAuthButtonClick("register")}
              className="btn btn-register"
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
