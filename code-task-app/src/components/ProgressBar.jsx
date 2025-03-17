// ProgressBar.jsx
import React from "react";

const ProgressBar = ({ completed, total }) => {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  return (
    <div style={{
      width: "100%",
      backgroundColor: "#e0e0de",
      borderRadius: "20px",
      marginBottom: "20px",
      height: "10px"
    }}>
      <div style={{
        width: `${percentage}%`,
        backgroundColor: "#AD998A",
        height: "100%",
        borderRadius: "20px",
        transition: "width 0.5s ease-in-out"
      }} />
    </div>
  );
};

export default ProgressBar;
