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
import Navbar from "./components/Navbar";
import Welcome from "./pages/Welcome";
import Login from "./pages/Login";
import Register from "./pages/Register";
import FormTest from "./pages/Form_Test";
import VideoPage from "./pages/VideoPage";
import "./App.css";

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
        <Route
          path="/"
          element={
            <Welcome
              isSplit={isSplit}
              formType={formType}
              onNavigate={handleSplitScreen}
              isAuthenticated={isAuthenticated}
            />
          }
        />
        {/* Optionally, direct routes to login/register if you want to allow that */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes */}
        <Route
          path="/form_test"
          element={isAuthenticated ? <FormTest /> : <Navigate to="/" />}
        />
        <Route
          path="/video"
          element={isAuthenticated ? <VideoPage /> : <Navigate to="/" />}
        />

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
