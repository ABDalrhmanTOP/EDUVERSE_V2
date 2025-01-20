import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // Use the same AuthContext as Navbar
import "../styles/dashboard_styles.css";

const Dashboard = () => {
    const navigate = useNavigate();
    const { isAuthenticated, logout } = useAuth(); // Use AuthContext for authentication

    const handleLogout = async () => {
        try {
            await logout(); // Use the logout function from AuthContext
            navigate("/login");
        } catch (error) {
            console.error("Error during logout:", error);
        }
    };

    const goToVideoPage = () => {
        if (!isAuthenticated) {
            navigate("/login");
        } else {
            navigate("/video");
        }
    };

    const goToFormTest = () => {
        if (!isAuthenticated) {
            navigate("/login");
        } else {
            navigate("/form_test");
        }
    };

    return (
        <div className="dashboard-container">
            <h1 className="dashboard-header">Welcome to Eduverse</h1>
            <div className="dashboard-content">
                <p>Discover a world of learning and growth with Eduverse.</p>
                <div className="image-section">
                    <img src="path_to_image" alt="Learning" className="homepage-image" />
                    <p>Join us today and unlock your potential!</p>
                </div>
                <button className="dashboard-button" onClick={goToVideoPage}>
                    Go to Video Page
                </button>
                <button className="dashboard-button" onClick={goToFormTest}>
                    Go to Form Test
                </button>
                {isAuthenticated && (
                    <button className="dashboard-button logout-button" onClick={handleLogout}>
                        Logout
                    </button>
                )}
            </div>
            <footer className="footer">
                <p>© 2025 Eduverse. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default Dashboard;