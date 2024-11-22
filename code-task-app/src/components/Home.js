import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  const goToVideoPage = () => {
    navigate('/video');
  };

  return (
    <div className="dashboard-container">
      <h2>Welcome to your Dashboard</h2>
      <p>Access your courses and manage your profile.</p>
      <div className="button-group">
        <button onClick={goToVideoPage} className="video-button">
          Go to Video Page
        </button>
      </div>
    </div>
  );
};

export default Home;
