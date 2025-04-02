// src/api/axios.js
import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:8000/api", // Adjust if needed
  withCredentials: true, // Required if using cookie-based auth (e.g., Sanctum)
});

// Immediately request the CSRF cookie (if using Laravel Sanctum)
(async () => {
  try {
    await axios.get("http://localhost:8000/sanctum/csrf-cookie", { withCredentials: true });
    console.log("CSRF cookie set");
  } catch (error) {
    console.error("CSRF cookie request failed:", error);
  }
})();

// Request interceptor: attach token from localStorage
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // Ensure token is stored with this key
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.headers.Accept = "application/json";
  // If data is not FormData, set Content-Type to application/json
  if (!(config.data instanceof FormData)) {
    config.headers["Content-Type"] = "application/json";
  }
  return config;
});

export default apiClient;
