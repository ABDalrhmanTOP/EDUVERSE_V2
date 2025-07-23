// src/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "../api/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Initialize from localStorage so that auth persists on refresh
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    return Boolean(token && storedUser);
  });
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  // On mount, set axios header if token exists
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
      axios.defaults.withCredentials = true;
    }
  }, []);

  const login = async (credentials) => {
    try {
      const response = await axios.post("/login", credentials);
      const { token, user: userData } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      axios.defaults.withCredentials = true;
      setIsAuthenticated(true);
      setUser(userData);
      // Redirect to dashboard after successful login
      // Note: SplitAuthModal handles the redirect, so we don't need to do it here
      return true;
    } catch (error) {
      console.error("Login failed:", error);
      return false;
    }
  };

  const registerUser = async (data) => {
    try {
      const response = await axios.post("/register", data);
      const { token, user: userData } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      axios.defaults.withCredentials = true;
      setIsAuthenticated(true);
      setUser(userData);
      // Redirect to dashboard after successful registration
      // Note: SplitAuthModal handles the redirect, so we don't need to do it here
      return true;
    } catch (error) {
      console.error("Registration failed:", error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await axios.post("/logout");
    } catch (error) {
      console.error("Logout failed:", error);
    }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    delete axios.defaults.headers.common["Authorization"];
    setIsAuthenticated(false);
    setUser(null);
  };

  // Update user info after profile changes
  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, registerUser, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext); 