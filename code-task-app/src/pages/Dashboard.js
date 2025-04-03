import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/Dashboard.css"; // <-- Use the new CSS

const Dashboard = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout, user } = useAuth(); // Get user if needed

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/"); // Navigate to home/login after logout
    } catch (error) {
      console.error("Error during logout:", error);
      // Handle logout error (e.g., show a message)
    }
  };

  // --- Navigation Functions ---
  // (Keep your existing goToVideoPage and goToFormTest functions)
   const goToVideoPage = () => {
     if (!isAuthenticated) {
         navigate("/login"); // Redirect to login if not authenticated
     } else {
         navigate("/homevideo"); // Navigate to the courses/video page
     }
   };

   const goToFormTest = () => { // Assuming this is maybe 'EduBot' or similar?
     if (!isAuthenticated) {
         navigate("/login");
     } else {
         navigate("/chat"); // Navigate to the chat/form test page
     }
   };
    const goToProfile = () => {
        navigate("/profile");
    }

  // Example: Get username
  const username = user ? (user.username || user.name || "User") : "User";

  return (
    <div className="dashboard-page-container">
      <div className="dashboard-card">
        <h1 className="dashboard-header">Welcome Back, {username}!</h1>
        <p className="dashboard-subtext">
            Ready to continue your learning journey?
        </p>

        <div className="dashboard-visual">
             <img
                // Replace with a relevant, inspiring dashboard image
                src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1528&q=80" // Example library/learning image
                alt="Learning environment"
                className="dashboard-image"
             />
        </div>

        <div className="dashboard-actions">
          <button className="dashboard-button primary-action" onClick={goToVideoPage}>
            Explore Courses
          </button>
          <button className="dashboard-button secondary-action" onClick={goToFormTest}>
            Chat with EduBot
          </button>
           <button className="dashboard-button secondary-action" onClick={goToProfile}>
                View Profile
          </button>
          {/* Conditional rendering for Admin Dashboard Link */}
          {isAuthenticated && user?.role === "admin" && (
              <button className="dashboard-button admin-action" onClick={() => navigate("/AdminDashboard")}>
                  Admin Panel
              </button>
          )}
        </div>

        {/* Logout button is often better placed in the Navbar dropdown,
             but keeping it here if it's part of your desired dashboard layout */}
        {isAuthenticated && (
          <button className="dashboard-button logout-button" onClick={handleLogout}>
            Logout
          </button>
        )}
      </div>

       {/* Footer can be shared or specific */}
      <footer className="footer dashboard-footer">
           <p>© {new Date().getFullYear()} Eduverse. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Dashboard;