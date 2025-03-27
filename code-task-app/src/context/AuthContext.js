// src/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "../api/axios";

// Create the context
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Local state for authentication and user info
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  // On mount, check localStorage for existing token & user
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      // Set default Authorization header for axios
      axios.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
      setIsAuthenticated(true);
      setUser(JSON.parse(storedUser)); // parse the stored user JSON
    }
  }, []);

  /**
   * Called by login form to authenticate the user.
   * Expects the backend to return { token, user }.
   */
  const login = async (credentials) => {
    try {
      const response = await axios.post("/login", credentials);
      // Example response structure:
      // {
      //   token: 'xxxx',
      //   user: {
      //     id: 1,
      //     name: 'adminEdu',
      //     username: 'adminedu',
      //     role: 'admin'
      //   }
      // }

      // Store token & user in localStorage
      const { token, user: userData } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));

      // Set the default header so subsequent requests include the token
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // Update state
      setIsAuthenticated(true);
      setUser(userData);

      return true; // indicate login success
    } catch (error) {
      console.error("Login failed:", error);
      return false;
    }
  };

  /**
   * Called by register form to create an account.
   * Expects the backend to return { token, user } similar to /login.
   */
  const registerUser = async (data) => {
    try {
      const response = await axios.post("/register", data);
      // Store token & user in localStorage
      const { token, user: userData } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));

      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setIsAuthenticated(true);
      setUser(userData);

      return true;
    } catch (error) {
      console.error("Registration failed:", error);
      return false;
    }
  };

  /**
   * Called to log out the user.
   * Optionally calls a logout endpoint on the backend to invalidate the token.
   */
  const logout = async () => {
    try {
      // If your backend has a /logout endpoint, call it:
      await axios.post("/logout");
    } catch (error) {
      console.error("Logout failed:", error);
    }

    // Remove token & user data
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    delete axios.defaults.headers.common["Authorization"];

    // Reset state
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        login,
        registerUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Helper hook to consume the AuthContext in other components
export const useAuth = () => useContext(AuthContext);
