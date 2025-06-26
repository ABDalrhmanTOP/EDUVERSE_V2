import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import "../styles/Auth.css";
import { useNavigate } from "react-router-dom";

const Login = ({ onFinished, onSwitchToRegister }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const success = await login({ email, password });
    setIsLoading(false);

    if (!success) {
      setMessage("Login failed. Please check your credentials.");
    } else {
      // Navigate to profile page (or dashboard) after successful login.
      navigate("/profile");
      if (onFinished) onFinished();
    }
  };

  return (
    <div className="auth-container animated-form">
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
          <button type="submit" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Login"}
          </button>
          {message && <p className="feedback">{message}</p>}
        </form>
        <div className="auth-footer">
          <p>
            No account yet?{" "}
            <span onClick={onSwitchToRegister}>Register here</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
