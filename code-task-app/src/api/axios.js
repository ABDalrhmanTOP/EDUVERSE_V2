// src/api/axios.js
import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:8000/api", // Update this if your backend runs elsewhere
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
instance.interceptors.request.use((config) => {
  // Check for both possible token keys
  const token = localStorage.getItem("token") || localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('Token attached to request:', token.substring(0, 20) + '...');
  } else {
    console.log('No token found in localStorage');
  }
  config.headers.Accept = "application/json";
  // If data is not FormData, set Content-Type to application/json
  if (!(config.data instanceof FormData)) {
    config.headers["Content-Type"] = "application/json";
  }
  console.log('Request config:', {
    url: config.url,
    method: config.method,
    hasToken: !!token,
    headers: config.headers
  });
  return config;
});

// Response interceptor: handle authentication errors
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error Response:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method
    });
    
    // If we get a 401, the token might be invalid
    if (error.response?.status === 401) {
      console.log('Authentication failed - clearing token');
      localStorage.removeItem("token");
      localStorage.removeItem("authToken");
    }
    
    return Promise.reject(error);
  }
);

export default instance;
