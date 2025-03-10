// src/AdminDashboard.js
import React from 'react';
import {  Outlet, useNavigate } from "react-router-dom";
import { FaUsers, FaChalkboardTeacher } from "react-icons/fa";

const AdminDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="container mt-5 text-center">
      <h2 className="mb-4 text-primary fw-bold">Control panel</h2>
      <div className="d-flex justify-content-center gap-3">
        <button
          className="btn btn-outline-primary btn-lg d-flex align-items-center gap-2"
          onClick={() => navigate(`/AdminDashboard/users`)}
        >
          <FaUsers size={20} />
          User management
        </button>
        <button
          className="btn btn-outline-success btn-lg d-flex align-items-center gap-2"
          onClick={() => navigate(`/AdminDashboard/courses`)}
        >
          <FaChalkboardTeacher size={20} />
          Course management
        </button>
      </div>
       <Outlet /> 
    </div>
  );
};

export default AdminDashboard;
