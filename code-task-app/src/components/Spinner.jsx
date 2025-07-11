// src/components/Spinner.js
import React from 'react';
//import './Spinner.css';

const Spinner = ({ className = '' }) => (
  <div className={`spinner-container ${className}`}>
    <div className="spinner"></div>
  </div>
);

export default Spinner;
