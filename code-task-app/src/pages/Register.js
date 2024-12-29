import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import "../styles/Auth.css";

const Register = () => {
    const [name, setName] = useState("");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [accept, setaccept] = useState(false);
    const navigate = useNavigate();
    const handleRegister = async (e) => {
        e.preventDefault();
        setaccept(true);
        if (name === "" || password.length < 8 || password !== confirmPassword) {
            return;
        }
        const emailRegex = /^[a-zA-Z0-9._%+-]+@(gmail\.com|hotmail\.com|yahoo\.com|icloud\.com|aol\.com)$/;
        if (!emailRegex.test(email)) {
            setMessage("The email is not real")
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
            setMessage("Registration successful");
            navigate("/login");
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
                    {name === "" && accept ? (<p style={{ color: "red", fontSize: "12px" }}>Please Enter Your Name"</p>) : ('')}
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
                    {password.length < 8 && accept ? (<p style={{ color: "red", fontSize: "12px" }}>Password must be more than 8 char</p>) : ('')}
                    <input
                        type="password"
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    {confirmPassword !== password && accept ? (<p style={{ color: "red", fontSize: "12px" }}>Password dose not match</p>) : ('')}
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
