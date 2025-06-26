import React from 'react';
import { useNavigate } from 'react-router-dom';
import "../styles/Welcome.css";

const WelcomeHome = () => {
  const navigate = useNavigate();

  const handleGoToVideos = () => {
    navigate('/videos');
  };

  return (
    <div>
      <h1>Welcome to EduVerse</h1>
      <p>Your gateway to mastering software engineering.</p>
      <button onClick={handleGoToVideos}>Go to Videos</button>
    </div>
  );
};

export default WelcomeHome;
