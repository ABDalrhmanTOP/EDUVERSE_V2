import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "../api/axios";
import "../styles/Auth.css";

const Register = () => {
    const [name, setName] = useState("");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");

    const handleRegister = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setMessage("Passwords do not match!");
            return;
        }

        try {
            await axios.post("/register", {
                name,
                username, 
                email,
                password,
                password_confirmation: confirmPassword, 
            });
            setMessage("Registration successful! Please log in.");
        } catch (error) {
            setMessage(
                "Error during registration: " +
                (error.response?.data?.message || error.message)
            );
        }
    };

    return (
        <div className="auth-container">
          <div className="branding">
            <h1>Register</h1>
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
                <button type="submit">Register</button>
                {message && <p className="feedback">{message}</p>}
            </form>
            <div className="auth-footer">
              <p>Already have an account? <Link to="/login"><span>Login here</span></Link>.</p>
            </div>
          </div>
        </div>
    );
};

export default Register;
