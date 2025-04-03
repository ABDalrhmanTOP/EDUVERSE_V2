import React from "react";
import "../styles/Welcome.css"; // <-- Use the new CSS
import Login from "./Login";
import Register from "./Register";

const Welcome = ({ isSplit, formType, onNavigate }) => {
  return (
    <div className={`welcome-page-container ${isSplit ? "split-active" : ""}`}>
      {/* Navbar would typically be outside this component in App.js */}

      <div className="welcome-content-area">
        {/* Left Section (Main Content) */}
        <div className={`welcome-left ${isSplit ? "split" : ""}`}>
          <div className="welcome-hero">
            <h1 className="welcome-header">Welcome to Eduverse</h1>
            <p className="welcome-subtext">
              Discover a world of interactive learning and growth. Your journey
              to knowledge begins here.
            </p>
          </div>

          <div className="features-section">
            <h2 className="features-title">Why Choose Eduverse?</h2>
            <div className="features-grid">
              <div className="feature-card">
                <img
                  // Replace with your actual image URL for Interactive Learning
                  src="https://images.unsplash.com/photo-1516321497487-e288fb19713f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80" // Example Image
                  alt="Interactive Learning"
                  className="feature-image"
                />
                <h3>Interactive Learning</h3>
                <p>Engage with dynamic lessons tailored for all learners.</p>
              </div>
              <div className="feature-card">
                <img
                  // Replace with your actual image URL for Video Tutorials
                  src="https://images.unsplash.com/photo-1542744095-291d1f67b221?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80" // Example Image
                  alt="Video Tutorials"
                  className="feature-image"
                />
                <h3>Expert Video Tutorials</h3>
                <p>Access expert-led video tutorials to deepen your knowledge.</p>
              </div>
              <div className="feature-card">
                <img
                  // Replace with your actual image URL for Progress Tracking
                  src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80" // Example Image
                  alt="Progress Tracking"
                  className="feature-image"
                />
                <h3>Track Your Progress</h3>
                <p>Monitor your learning journey and achieve your goals.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section - shows Login or Register form if isSplit is true */}
        {isSplit && (
          <div className="welcome-right">
            <div className="form-wrapper">
              {/* Add a close button if needed */}
              {/* <button onClick={() => onNavigate(null)} className="close-form-btn">X</button> */}
              {formType === "login" && (
                <Login
                  onFinished={() => onNavigate(null)} // Navigate away or to dashboard
                  onSwitchToRegister={() => onNavigate("register")}
                />
              )}
              {formType === "register" && (
                <Register
                  onFinished={() => onNavigate(null)} // Navigate away or to dashboard
                  onSwitchToLogin={() => onNavigate("login")}
                />
              )}
            </div>
          </div>
        )}
      </div>

      <footer className="footer welcome-footer">
        <p>© {new Date().getFullYear()} Eduverse. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Welcome;