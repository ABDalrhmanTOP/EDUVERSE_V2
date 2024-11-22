import React from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";

const Dashboard = () => {
    const navigate = useNavigate();

    // Handle logout
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

    return (
        <div>
            <h1>Dashboard</h1>
            <button onClick={goToVideoPage}>Go to Video Page</button>
            <button onClick={handleLogout}>Logout</button>
        </div>
    );
};

export default Dashboard;
