import React, { useState , useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/Navbar.css";
import { FaUserCircle } from "react-icons/fa";

const Navbar = ({ onNavigate, isFormOpen }) => {
  const { isAuthenticated, logout, user } = useAuth();
  const [isNavbarOpen, setIsNavbarOpen] = useState(false)
   const [user1, setUser] = useState(null); ;
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [activeForm, setActiveForm] = useState(null);
  const navigate = useNavigate();
  // Burger toggler

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    console.log(storedUser)
    if (storedUser) {
      setUser(JSON.parse(storedUser)); // تحويل النص إلى كائن
    }
  }, []);
  const toggleNavbar = () => {
    setIsNavbarOpen(!isNavbarOpen);
  };
  // Additional button for EduBot
  const handleEduBot = () => {
    if (!isAuthenticated) {
      navigate("/login");  // Redirect to login if not authenticated
    } else {
      navigate("/chat");  // Redirect to chat page
    }
  };
  

  // Toggle login/register forms
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

  // Toggle the small dropdown under profile icon
  const toggleProfileMenu = () => {
    setShowProfileMenu((prev) => !prev);
  };

  // Logout from the dropdown
  const handleLogout = () => {
    logout();
    localStorage.removeItem("user");
    setShowProfileMenu(false);
    navigate("/");
  };

  // Condition for navbar transparency if a form is open
  const navbarClasses = [
    "navbar",
    "nav_container",
    isFormOpen ? "navbar-transparent" : "",
  ].join(" ");

  const handleDashboard = () => {
    navigate("/AdminDashboard");
  };
  const handleHomeVideo= () => {
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
        {user1?.role === 'admin' && (
          <button className="nav-link custom-link" onClick={handleDashboard}>
            Admin
          </button>
        )}
        
      </div>


      {/* Burger toggler (mobile) */}
      <button
        className={`navbar-toggler ${isNavbarOpen ? "open" : ""}`}
        type="button"
        onClick={toggleNavbar}
        aria-label="Toggle navigation"
      >
        <span className="navbar-toggler-icon"></span>
      </button>

      {/* Right Section: either form buttons or profile */}
      <div className={`navbar-right ${isNavbarOpen ? "show" : ""}`}>
        {isAuthenticated ? (
          <div className="profile-container">
            <div className="profile-icon" onClick={toggleProfileMenu}>
              <FaUserCircle size={32} /> {/* Increased size from 24 to 32 */}
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
