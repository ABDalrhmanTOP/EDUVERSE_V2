import React from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import "../styles/dashboard_styles.css"; 

const Dashboard = () => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await axios.post("/logout");
            localStorage.removeItem("token"); 
            navigate("/login"); 
        } catch (error) {
            console.error("Error during logout:", error);
        }
    };

    const goToVideoPage = () => {
        navigate("/video"); 
    };
    const goToForm_test =()=> {
        navigate("/form_test");
    }

    return (
        <div className="dashboard-container">
            <h1 className="dashboard-header">Dashboard</h1>
            <div className="dashboard-content">
                <button className="dashboard-button" onClick={goToVideoPage}>Go to Video Page</button>
                <button className="dashboard-button" onClick={goToForm_test}>Go to Form Test</button>
                <button className="dashboard-button logout-button" onClick={handleLogout}>Logout</button>
            </div>
        </div>
    );
};

export default Dashboard;
