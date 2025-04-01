import axios from "axios";

// Configure base Axios client
const apiClient = axios.create({
  baseURL: "http://localhost:8000/api", // No trailing slash
  withCredentials: true, // Required for cookies
});

// Add CSRF protection (MUST happen before any API calls)
await axios.get("http://localhost:8000/sanctum/csrf-cookie", {
  withCredentials: true,
});

// Request interceptor for auth token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("bearerToken");
  
  // Attach Bearer token if available
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Required headers for Laravel API
  config.headers.Accept = "application/json";
  config.headers["Content-Type"] = "application/json";
  
  return config;
});

export default apiClient;