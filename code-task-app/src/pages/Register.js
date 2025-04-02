import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import "../styles/Auth.css";

const Register = ({ onFinished, onSwitchToLogin }) => {
  const { registerUser } = useAuth();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    const success = await registerUser({
      name,
      username,
      email,
      password,
      password_confirmation: confirmPassword,
    });
    setIsLoading(false);

    if (!success) {
      setMessage("Registration failed. Please try again.");
    } else {
      // Optionally navigate to the profile page after registration
      if (onFinished) onFinished();
    }
  };

  return (
    <div className="auth-container animated-form">
      <div className="branding">
        <h1>Register</h1>
        {message && <p className="feedback">{message}</p>}
        <p>Create an account to start your learning journey.</p>
      </div>
      <div className="form-section">
        <form onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
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
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <button type="submit" disabled={isLoading}>
            {isLoading ? "Registering..." : "Register"}
          </button>
          {message && <p className="feedback">{message}</p>}
        </form>
        <div className="auth-footer">
          <p>
            Have an account?{" "}
            <span onClick={onSwitchToLogin}>Login here</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
