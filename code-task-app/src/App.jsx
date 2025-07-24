// src/App.jsx
import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useParams,
  useLocation,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

// i18n
import { initializeLanguage } from "./i18n";

// Your components
import Navbar from "./components/navbar";
import Homepage from "./components/Homepage";
import HomeVideo from "./pages/HomeVideo";
import VideoPage from "./pages/VideoPage";
import CoursePage from "./pages/CoursePage";
import Profile from "./pages/Profile";
import ChatApp from "./pages/ChatApp";
import FinalProject from "./components/FinalProject";
import PlacementTest from "./pages/PlacementTest";
import NotificationsPage from "./pages/NotificationsPage";
import SubscriptionPlans from "./pages/SubscriptionPlans";
import SubscriptionHistory from "./pages/SubscriptionHistory";
import Dashboard from "./pages/Dashboard";

// Community components
import Community from "./pages/Community";
import CommunityPost from "./pages/CommunityPost";
import NewCommunityPost from "./pages/NewCommunityPost";

// Admin
import AdminDashboard from "./components/admin/AdminDashboard";
import CoursesList from "./components/admin/CoursesList";
import UsersList from "./components/admin/UsersList";
import UserDetail from "./components/admin/UserDetial";
import TaskList from "./components/admin/TaskList";
import TasksDashboard from "./components/admin/TasksDashboard";
import TestsDashboard from './components/admin/TestsDashboard';
import AdminSubscriptions from "./pages/admin/AdminSubscriptions";
// import AdminPayments from "./components/admin/AdminPayments"; // removed

import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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

const FinalProjectWrapper = () => {
  // Try to get courseId from query string or global state if needed
  const params = useParams();
  const location = useLocation();
  let courseId = params.courseId;
  if (!courseId) {
    // Try to get from query string
    const searchParams = new URLSearchParams(location.search);
    courseId = searchParams.get("courseId");
  }
  // Fallback: could use context or global state if needed
  return <FinalProject courseId={courseId} />;
};

const App = () => {
  const [formType, setFormType] = useState(null);

  // Initialize i18n and language settings
  useEffect(() => {
    initializeLanguage();
  }, []);

  return (
    <>
      <ToastContainer />
      <Navbar setFormType={setFormType} />
      <Routes>
        {/* Public/Homepage */}
        <Route
          path="/"
          element={
            <Homepage formType={formType} setFormType={setFormType} />
          }
        />

        {/* User Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
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
          path="/video"
          element={
            <ProtectedRoute>
              <VideoPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/course/:courseId"
          element={
            <ProtectedRoute>
              <CoursePage />
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
              <FinalProjectWrapper />
            </ProtectedRoute>
          }
        />
        <Route
          path="/subscription-plans"
          element={
            <ProtectedRoute>
              <SubscriptionPlans />
            </ProtectedRoute>
          }
        />
        <Route
          path="/subscription-history"
          element={
            <ProtectedRoute>
              <SubscriptionHistory />
            </ProtectedRoute>
          }
        />

        {/* Remove all FinalTest routes and references */}

        <Route
          path="/placement-test/:courseId"
          element={
            <ProtectedRoute>
              <PlacementTest />
            </ProtectedRoute>
          }
        />

        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />

        {/* Community */}
        <Route
          path="/community"
          element={
            <ProtectedRoute>
              <Community />
            </ProtectedRoute>
          }
        />
        <Route
          path="/community/new"
          element={
            <ProtectedRoute>
              <NewCommunityPost />
            </ProtectedRoute>
          }
        />
        <Route
          path="/community/posts/:id"
          element={
            <ProtectedRoute>
              <CommunityPost />
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
          <Route path="users" element={<UsersList />} />
          <Route path="userdetail/:user_id" element={<UserDetail />} />
          <Route path="courses" element={<CoursesList />} />
          <Route path="tasks" element={<TasksDashboard />} />
          <Route path="TaskList/:course_id" element={<TaskList />} />
          <Route path="analytics" element={<div>Analytics Page - Coming Soon</div>} />
          <Route path="settings" element={<div>Settings Page - Coming Soon</div>} />
          <Route path="profile" element={<div>Profile Page - Coming Soon</div>} />
          <Route path="edubot" element={<div>EduBot Settings - Coming Soon</div>} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="tests" element={<TestsDashboard />} />
          <Route path="subscriptions" element={<AdminSubscriptions />} />
          {/* <Route path="payments" element={<AdminPayments />} /> removed */}
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
