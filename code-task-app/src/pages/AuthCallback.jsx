import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const userJson = params.get("user");
    if (token && userJson) {
      try {
        const user = JSON.parse(decodeURIComponent(userJson));
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        // Force full reload so AuthContext updates
        window.location.replace("/");
        return;
      } catch (e) {
        // ignore
      }
    }
    // Redirect to homepage after short delay
    setTimeout(() => navigate("/", { replace: true }), 800);
  }, [navigate]);

  return (
    <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
      <div className="glassmorphism" style={{ padding: 32, borderRadius: 18, boxShadow: "0 2px 16px rgba(191,174,158,0.12)", textAlign: "center" }}>
        <h2>Signing you in...</h2>
        <div className="spinner" style={{ margin: "24px auto", width: 48, height: 48, border: "6px solid #e6d3b3", borderTop: "6px solid #a68a6d", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
};

export default AuthCallback; 