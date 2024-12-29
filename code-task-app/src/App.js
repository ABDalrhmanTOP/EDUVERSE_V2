import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Protectedformtest from "./components/ProtectedRormTest";
import VideoPage from "./pages/VideoPage";
import Navbar from "./components/Navbar";
import './App.css';
import Form_Test from "./pages/form_test";
const App = () => {
  return (
    <Router>
      <Routes>
        {/* Redirect Default Route to /login */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Route */}
        <Route path="/navbar"element={
              <Navbar/>
            }
            />
        <Route path="/Form_Test" element={
          <Form_Test/>
        } 
          />
          
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/video"
          element={
            <ProtectedRoute>
              <Protectedformtest>
              <VideoPage />
              </Protectedformtest>
            </ProtectedRoute>
          }
        />

      </Routes>
    </Router>
  );
};

export default App;
