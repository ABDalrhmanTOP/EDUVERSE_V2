import React from "react";
import { Navigate } from "react-router-dom";

const Protectedformtest = ({ children }) => {

   const test_token = localStorage.getItem("test_token");
  
    if (!test_token) {
      // <Navigate to="/Form_Test" />;
    }
    return (children );
  };

  export default Protectedformtest;  