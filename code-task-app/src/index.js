import React from "react";
import ReactDOM from "react-dom/client";
import WrappedApp from "./App"; 
import "./index.css";

// Import the AuthProvider
import { AuthProvider } from "./context/AuthContext";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <AuthProvider>
    <WrappedApp />
  </AuthProvider>
);
