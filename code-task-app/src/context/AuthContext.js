// src/context/AuthContext.js
import React, {
    createContext,
    useState,
    useEffect,
    useContext
  } from "react";
  import axios from "../api/axios";
  
  const AuthContext = createContext();
  
  export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
  
    // Check localStorage for an existing token on mount
    useEffect(() => {
      const token = localStorage.getItem("token");
      if (token) {
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        setIsAuthenticated(true);
      }
    }, []);
  
    // Called by login form to authenticate the user
    const login = async (credentials) => {
      try {
        const response = await axios.post("/login", credentials);;
        // Store the role
        const role = response.data.user.role;
        localStorage.setItem("role",  role );
        // Store the token and configure Axios
        const { token  } = response.data;
        localStorage.setItem("token", token );
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        setIsAuthenticated(true);
        return true;
      } catch (error) {
        console.error("Login failed:", error);
        return false;
      }
    };
  
    // Called by register form to create an account
    const registerUser = async (data) => {
      try {
        const response = await axios.post("/register", data);
       // Store the role
       const role = response.data.user.role;
       localStorage.setItem("role", role);
      
        const { token } = response.data;
  
        localStorage.setItem("token", token);
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        setIsAuthenticated(true);
        return true;
      } catch (error) {
        console.error("Registration failed:", error);
        return false;
      }
    };
  
    // Called to log out the user
    const logout = async () => {
      try {
        // Optional: call backend logout route if you have it
        await axios.post("/logout");
      } catch (error) {
        console.error("Logout failed:", error);
      }
      // Remove token & reset auth state
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      delete axios.defaults.headers.common["Authorization"];
      setIsAuthenticated(false);
    };
  
    return (
      <AuthContext.Provider
        value={{
          isAuthenticated,
          login,
          registerUser,
          logout
        }}
      >
        {children}
      </AuthContext.Provider>
    );
  };
  
  // Helper hook to consume the AuthContext
  export const useAuth = () => useContext(AuthContext);
  