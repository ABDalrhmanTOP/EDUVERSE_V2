// src/App.js
import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate
} from "react-router-dom";
import { useAuth, AuthProvider } from "./context/AuthContext";
import Navbar from "./components/navbar";
import Welcome from "./pages/Welcome";
import Login from "./pages/Login";
import Register from "./pages/Register";
import FormTest from "./pages/form_test";
import VideoPage from "./pages/VideoPage";
import AdminDashboard from "./components/admin/AdminDashboard";
import CoursesList from "./components/admin/CoursesList";
import UsersList from "./components/admin/UsersList";
import UserDetail from "./components/admin/UserDetial";
import HomeVideo from "./pages/HomeVideo"
import "./App.css";
import Profile from "./pages/Profile";
import './App.css';
import "bootstrap/dist/css/bootstrap.min.css";
import ChatApp from "./pages/ChatApp";

// The main App that uses AuthContext
const App = () => {
  const { isAuthenticated } = useAuth();

  // State for controlling the split-screen in Welcome
  const [isSplit, setIsSplit] = useState(false);
  const [formType, setFormType] = useState(null);
  const navigate = useNavigate();

  // Toggle split-screen for login/register forms
  const handleSplitScreen = (type) => {
    setIsSplit(!!type);
    setFormType(type);
  };

  return (
    <>
      {/* Pass handleSplitScreen to the Navbar */}
      <Navbar
        onNavigate={handleSplitScreen}
        isFormOpen={!!(formType === "login" || formType === "register")}
      />
  
      
<Routes>
  {/* ✅ ChatPage should be at the same level as other main routes */}
  <Route path="/chat" element={isAuthenticated ? <ChatApp/> : <Navigate to="/login" />} />

  {/* ✅ Other Routes */}
  <Route path="/" element={<Welcome isSplit={isSplit} formType={formType} onNavigate={handleSplitScreen} isAuthenticated={isAuthenticated} />} />
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />
  <Route path="/profile" element={<Profile />} />
  <Route path="/homevideo" element={<HomeVideo />} />

  {/* ✅ Protected Routes */}
  <Route
  path="/foem_test"
  element={isAuthenticated ? <FormTest/>: <navigate to="/"/>}
  />
  <Route
  path="/video"
  element={isAuthenticated ? <VideoPage/>: <navigate to="/"/>}
  />


  {/* ✅ Admin Routes */}
  <Route path="/AdminDashboard" element={<AdminDashboard />}>
    <Route path="users" element={<UsersList />} />
    <Route path="courses" element={<CoursesList />} />
    <Route path="userdetail/:user_id" element={<UserDetail />} />
  </Route>

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
