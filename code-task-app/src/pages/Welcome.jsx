import React from "react";
import "../styles/Welcome.css";
import Login from "./Login";
import Register from "./Register";

const Welcome = ({ isSplit, formType, onNavigate, isAuthenticated }) => {
  return (
    <div className="welcome-container">
      {/* Left Section */}
      <div className={`welcome-left ${isSplit ? "split" : ""}`}>
        <h1 className="welcome-header animate-fade">Welcome to Eduverse</h1>
        <p className="welcome-subtext animate-fade">
          Discover a world of interactive learning and growth.
        </p>
        <div className="features-section">
          <h2>Why Choose Eduverse?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <img
                src="https://via.placeholder.com/300"
                alt="Interactive Learning"
              />
              <h3>Interactive Learning</h3>
              <p>Engage with dynamic lessons tailored for all learners.</p>
            </div>
            <div className="feature-card">
              <img
                src="https://via.placeholder.com/300"
                alt="Video Tutorials"
              />
              <h3>Video Tutorials</h3>
              <p>Access expert-led video tutorials to deepen your knowledge.</p>
            </div>
            <div className="feature-card">
              <img
                src="https://via.placeholder.com/300"
                alt="Progress Tracking"
              />
              <h3>Track Your Progress</h3>
              <p>Monitor your learning journey and set new goals.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section - shows Login or Register form if isSplit is true */}
{
  isSplit && (
    <div className="welcome-right">
      <div className="form-container">
        {formType === "login" && (
          <Login
            onFinished={() => onNavigate(null)}
            onSwitchToRegister={() => onNavigate("register")}
          />
        )}
        {formType === "register" && (
          <Register
            onFinished={() => onNavigate(null)}
            onSwitchToLogin={() => onNavigate("login")}
          />
        )}
      </div>
    </div>
  )
}


      <footer className="footer">
        <p>© 2025 Eduverse. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Welcome;