// src/AdminDashboard.js
import React from 'react';
import { Outlet, useNavigate } from "react-router-dom";
import { FaUsers, FaChalkboardTeacher } from "react-icons/fa";

const AdminDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="container mt-5">
      <div className="text-center mb-5"> {/* Centralized heading with more bottom margin */}
        <h2 className="mb-3 fw-bold display-5" style={{ color: '#4B3F38' }}> {/* Larger font, bolder, consistent dark brown */}
          Admin Control Panel
        </h2>
        <p className="lead text-muted">Manage users and courses with ease.</p> {/* Added a subtle tagline */}
      </div>

      <div className="d-flex justify-content-center gap-4"> {/* Increased gap between buttons */}
        {/* User Management Button */}
        <button
          className="btn btn-primary d-flex flex-column align-items-center justify-content-center p-4 shadow-lg border-0"
          onClick={() => navigate(`/AdminDashboard/users`)}
          style={{
            backgroundColor: '#AD998A', // Warm, earthy brown
            color: '#FFFFFF', // White text
            width: '200px', // Fixed width for consistent size
            height: '150px', // Fixed height
            borderRadius: '1rem', // More rounded corners
            transition: 'all 0.3s ease', // Smooth transition for hover effects
            fontSize: '1.2rem',
            fontWeight: 'bold',
            textDecoration: 'none' // Ensure no underline if it acts like a link
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#8B7B6A'} // Darken on hover
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#AD998A'} // Revert on mouse leave
        >
          <FaUsers size={40} className="mb-2" /> {/* Larger icon, margin bottom */}
          User Management
        </button>

        {/* Course Management Button */}
        <button
          className="btn btn-success d-flex flex-column align-items-center justify-content-center p-4 shadow-lg border-0"
          onClick={() => navigate(`/AdminDashboard/courses`)}
          style={{
            backgroundColor: '#8B7B6A', // Slightly darker, complementary brown
            color: '#FFFFFF', // White text
            width: '200px', // Fixed width
            height: '150px', // Fixed height
            borderRadius: '1rem', // More rounded corners
            transition: 'all 0.3s ease', // Smooth transition for hover effects
            fontSize: '1.2rem',
            fontWeight: 'bold',
            textDecoration: 'none'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#6D5B4A'} // Darken on hover
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#8B7B6A'} // Revert on mouse leave
        >
          <FaChalkboardTeacher size={40} className="mb-2" /> {/* Larger icon, margin bottom */}
          Course Management
        </button>
      </div>
      <Outlet />
    </div>
  );
};

export default AdminDashboard;