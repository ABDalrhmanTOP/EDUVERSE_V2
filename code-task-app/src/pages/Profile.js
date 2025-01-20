// src/pages/Profile.js
import React, { useEffect, useState } from "react";
import axios from "../api/axios"; // your Axios instance with the auth token
import "../styles/Profile.css";

const Profile = () => {
  // local states
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(""); // if user wants to update
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  // 1. Fetch user data from /profile or /user
  const fetchProfile = async () => {
    try {
      // you can adjust to your route, e.g. /api/profile or /api/user
      const response = await axios.get("/profile"); 
      const user = response.data;
      setName(user.name || "");
      setUsername(user.username || "");
      setEmail(user.email || "");
    } catch (err) {
      console.error("Failed to fetch profile:", err);
      setError("Failed to load profile.");
    }
  };

  // 2. Save updates to /profile
  const handleSave = async () => {
    setLoading(true);
    setMessage("");
    setError("");
    try {
      const response = await axios.put("/profile", {
        name,
        username,
        email,
        password, // only update if provided
      });
      setMessage(response.data.message || "Profile updated!");
      setEditMode(false);
      // Optionally, re-fetch profile data to ensure it's up-to-date
      // fetchProfile();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to update profile. Check console for details."
      );
    } finally {
      setLoading(false);
    }
  };

  // 3. Basic "Google Email Check"
  const checkEmailWithGoogle = async () => {
    /*
      REAL Google SSO or "Sign in with Google" requires OAuth or a token 
      verification. The code below demonstrates an example approach:
        1) Check DNS records or use a 3rd party API to see if email domain is "gmail.com"
        2) Possibly verify there's an MX record for google.com
      This is not official “Google account verification” (like OAuth).
    */
    if (!email.endsWith("@gmail.com")) {
      setError("Email is not a Gmail address.");
      return;
    }
    // Example: you could do an API call to verify domain's MX, 
    // or check some open API that pings if the mailbox actually exists.
    setMessage("Email appears to be a valid Google (Gmail) address!");
  };

  return (
    <div className="profile-container-page">
      <h2>My Profile</h2>
      {error && <p className="profile-error">{error}</p>}
      {message && <p className="profile-message">{message}</p>}

      {editMode ? (
        <div className="profile-edit-form">
          <label>Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label>Password (optional):</label>
          <input
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="profile-buttons">
            <button
              className="btn-cancel"
              onClick={() => {
                setEditMode(false);
                setMessage("");
                setError("");
                setPassword("");
              }}
            >
              Cancel
            </button>
            <button className="btn-save" onClick={handleSave} disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </button>
          </div>

          <button className="btn-google-check" onClick={checkEmailWithGoogle}>
            Check Email w/ Google
          </button>
        </div>
      ) : (
        <div className="profile-details">
          <p>
            <strong>Name:</strong> {name}
          </p>
          <p>
            <strong>Username:</strong> {username}
          </p>
          <p>
            <strong>Email:</strong> {email}
          </p>

          <div className="profile-buttons">
            <button className="btn-edit" onClick={() => setEditMode(true)}>
              Edit Profile
            </button>
            <button className="btn-google-check" onClick={checkEmailWithGoogle}>
              Check Email w/ Google
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
