import React from 'react';
// import Confetti from 'react-confetti';
import { FaCheckCircle, FaTrophy } from 'react-icons/fa';



const SuccessCelebration = ({ plan }) => {
  const totalCourses = plan?.id === '1' ? 1 : plan?.id === '3' ? 3 : 10;
  return (
    <div className="success-bg-animated" style={{ minHeight: '100vh', display: 'flex', borderRadius: '32px',  justifyContent: 'center', background: 'linear-gradient(120deg, #f5f1eb 0%, #e3cfa4 50%, #b5a079 100%)' }}>
      <div className="success-celebration-glassy" style={{
      
        boxShadow: '0 16px 48px 0 #b5a07922, 0 2px 12px 0 #e3cfa444, 0 0 0 4px #e3cfa455, 0 0 0 2px #b5a07933, inset 0 2px 24px 0 #e3cfa422',
        borderRadius: '32px',
        padding: '2.5rem 2.5rem 2.5rem 2.5rem',
        background: 'rgba(255,255,255,0.97)',
        maxWidth: 480,
        width: '100%',
        textAlign: 'center',
        position: 'relative',
        border: '2.5px solid #e3cfa4',
        borderBottom: '2px solid #b5a079', // حدود أوضح في الأسفل
        animation: 'fadeInUp 0.7s cubic-bezier(.39,.575,.56,1.000)'
      }}>
         <FaCheckCircle className="success-icon" style={{ color: '#b5a079', fontSize: '2.2rem', verticalAlign: 'middle', marginRight: 8, animation: 'pop 0.7s' }} />
        <h2 className="success-gradient-text" style={{
          fontSize: '2rem', fontWeight: 900, margin: '0 0 0.5rem 0',
          background: 'linear-gradient(90deg, #b5a079 30%, #e3cfa4 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          textShadow: '0 2px 12px #e3cfa4',
          letterSpacing: 1
        }}>
         
          Payment Successful!
        </h2>
        <div style={{ fontSize: '1.25rem', color: '#7d6a4d', fontWeight: 700, marginBottom: 10 }}>
          Congratulations! Your payment was successful and your subscription is now active.
        </div>
        {plan && (
          <div className="success-plan-card" style={{
            background: '#fffbe9cc',
            borderRadius: 18,
            padding: '1.2rem 1rem',
            margin: '1.2rem 0 1.2rem 0',
            boxShadow: '0 2px 8px #b5a07922',
            border: '1.5px solid #e3cfa4'
          }}>
            <h3 className="success-plan-title" style={{ color: '#b5a079', fontWeight: 700, fontSize: '1.2rem', marginBottom: 6 }}>{plan.title}</h3>
            <div className="success-plan-price accent" style={{ color: '#b5a079', fontWeight: 700, fontSize: '1.1rem', marginBottom: 6 }}>Amount: {plan.price}</div>
            <div className="success-plan-courses" style={{ color: '#e3cfa4', fontWeight: 600, fontSize: '1.05rem', marginBottom: 6 }}>
              <FaTrophy className="success-trophy" style={{ color: '#e3cfa4', marginRight: 5 }} />
              Number of Courses: {totalCourses}
            </div>
            {plan.desc && (
              <div style={{ color: '#7d6a4d', fontSize: '0.98rem', marginTop: 4 }}>{plan.desc}</div>
            )}
            <div className="progress-bar" style={{ margin: '1rem 0 0.5rem 0', background: '#f5f1eb', borderRadius: 8, height: 8 }}>
              <div className="progress-fill" style={{ width: '100%', background: 'linear-gradient(90deg, #b5a079, #e3cfa4)', height: 8, borderRadius: 8 }}></div>
            </div>
          </div>
        )}
        <div className="success-sub-message" style={{ color: '#7d6a4d', fontSize: '1.05rem', marginBottom: 18 }}>
          You can now access your selected courses from the courses page.
        </div>
        <button
          className="success-go-btn gradient-btn"
          style={{
            background: 'linear-gradient(90deg, #b5a079, #e3cfa4, #f5f1eb)',
            color: '#fff',
            fontWeight: 800,
            fontSize: '1.1rem',
            border: 'none',
            borderRadius: 16,
            padding: '0.85rem 2.2rem',
            marginTop: 0.5,
            boxShadow: '0 2px 8px #b5a07922',
            cursor: 'pointer',
            transition: 'background 0.2s',
            letterSpacing: 0.7
          }}
          onClick={() => {
            const courseId = plan?.courseId || plan?.course_id;
            if (courseId) {
              window.location.href = `/course/${courseId}`;
            } else {
              window.location.href = '/homevideo';
            }
          }}
        >
          Go to Courses
        </button>
      </div>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: scale(0.92) translateY(40px); }
          80% { transform: scale(1.03) translateY(-8px); opacity: 1; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        @keyframes bounce {
          0% { transform: translateY(0); }
          100% { transform: translateY(-12px); }
        }
        @keyframes pop {
          0% { transform: scale(0.7); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default SuccessCelebration; 