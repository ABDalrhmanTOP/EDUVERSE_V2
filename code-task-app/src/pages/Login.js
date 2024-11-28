import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; 
import axios from "../api/axios";
import "../styles/Auth.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate(); 

  const handleLogin = async (e) => {
    e.preventDefault(); 
    try {
      const response = await axios.post("/login", { email, password });
      localStorage.setItem("token", response.data.token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${response.data.token}`;
      navigate("/dashboard"); 
    } catch (error) {
      console.error("Login error:", error);
      setMessage("Login failed. Please check your credentials.");
    }
  };

  return (
    <div className="auth-container">
      <div className="branding">
        <h1>Login</h1>
        <p>Access your account to continue learning.</p>
      </div>
      <div className="form-section">
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit">Login</button>
          {message && <p className="feedback">{message}</p>}
        </form>
        <div className="auth-footer">
          <p>
            Don't have an account? <Link to="/register"><span>Register here</span></Link>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
