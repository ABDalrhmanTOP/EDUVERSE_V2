// src/App.jsx
import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Your components
import Navbar from "./components/navbar";
import Homepage from "./components/Homepage";
import HomeVideo from "./pages/HomeVideo";
import FormTest from "./pages/form_test";
import VideoPage from "./pages/VideoPage";
import Profile from "./pages/Profile";
import ChatApp from "./pages/ChatApp";
import FinalProject from "./components/FinalProject";

// Admin
import AdminDashboard from "./components/admin/AdminDashboard";
import CoursesList from "./components/admin/CoursesList";
import UsersList from "./components/admin/UsersList";
import UserDetail from "./components/admin/UserDetial";
import TaskList from "./components/admin/TaskList";
import TasksDashboard from "./components/admin/TasksDashboard";

import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";

// ----------------- ProtectedRoute -----------------
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }
  return isAuthenticated ? children : <Navigate to="/" />;
};

// --------------- AdminProtectedRoute --------------
const AdminProtectedRoute = ({ children }) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }
  if (user?.role !== "admin") {
    return <Navigate to="/" />;
  }
  return children;
};

const App = () => {
  const [formType, setFormType] = useState(null);

  return (
    <>
      <Navbar setFormType={setFormType} />
      <Routes>
        {/* Public/Homepage */}
        <Route
          path="/"
          element={
            <Homepage formType={formType} setFormType={setFormType} />
          }
        />

        {/* Protected */}
        <Route
          path="/homevideo"
          element={
            <ProtectedRoute>
              <HomeVideo />
            </ProtectedRoute>
          }
        />
        {/* NOTE: single param "levelId" */}
        <Route
          path="/form_test/:levelId"
          element={
            <ProtectedRoute>
              <FormTest />
            </ProtectedRoute>
          }
        />
        <Route
  path="/video"
  element={
    <ProtectedRoute>
      <VideoPage />
    </ProtectedRoute>
  }
/>

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <ChatApp />
            </ProtectedRoute>
          }
        />
        <Route
          path="/final-project"
          element={
            <ProtectedRoute>
              <FinalProject />
            </ProtectedRoute>
          }
        />

        {/* Admin */}
        <Route
          path="/AdminDashboard"
          element={
            <AdminProtectedRoute>
              <AdminDashboard />
            </AdminProtectedRoute>
          }
        >
          <Route index element={<div />} />
          <Route path="users" element={<UsersList />} />
          <Route path="userdetail/:user_id" element={<UserDetail />} />
          <Route path="courses" element={<CoursesList />} />
          <Route path="tasks" element={<TasksDashboard />} />
          <Route path="TaskList/:course_id" element={<TaskList />} />
          <Route path="analytics" element={<div>Analytics Page - Coming Soon</div>} />
          <Route path="settings" element={<div>Settings Page - Coming Soon</div>} />
          <Route path="profile" element={<div>Profile Page - Coming Soon</div>} />
          <Route path="edubot" element={<div>EduBot Settings - Coming Soon</div>} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
};

const WrappedApp = () => (
  <AuthProvider>
    <Router>
      <App />
    </Router>
  </AuthProvider>
);

export default WrappedApp;
