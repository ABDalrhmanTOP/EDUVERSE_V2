import React from 'react';
// import Confetti from 'react-confetti';
import { FaCheckCircle, FaTrophy } from 'react-icons/fa';
import '../styles/CheckoutForm.css';
import '../styles/SubscriptionHistory.css';

const SuccessCelebration = ({ plan }) => {
  // Calculate progress bar value if plan info is available
  const totalCourses = plan?.id === '1' ? 1 : plan?.id === '3' ? 3 : 10;
  return (
    <div className="success-bg-animated">
      {/* <Confetti /> */}
      <div className="success-celebration-glassy">
        <div className="success-emoji">🎉</div>
        <h2 className="success-gradient-text">
          <FaCheckCircle className="success-icon" /> Payment Successful!
        </h2>
        {plan && (
          <div className="success-plan-card">
            <h3 className="success-plan-title">{plan.title}</h3>
            <div className="success-plan-price accent">Amount: {plan.price}</div>
            <div className="success-plan-courses">
              <FaTrophy className="success-trophy" />
              Number of Courses: {totalCourses}
            </div>
            <div className="progress-bar" style={{ margin: '1rem 0 0.5rem 0' }}>
              <div className="progress-fill" style={{ width: '100%' }}></div>
            </div>
          </div>
        )}
        <div className="success-message">
          Congratulations! Your payment was successful and your subscription is now active.
        </div>
        <div className="success-sub-message">
          You can now access your selected courses from the courses page.
        </div>
        <button
          className="success-go-btn gradient-btn"
          onClick={() => window.location.href = '/homevideo'}
        >
          Go to Courses
        </button>
      </div>
    </div>
  );
};

export default SuccessCelebration; 