import React, { useState } from "react";
import CheckoutForm from "../components/CheckoutForm";
import "../styles/SubscriptionPlans.css";
import { useLocation } from "react-router-dom";
import { useAuth } from '../context/AuthContext';

const plans = [
  {
    id: '1',
    title: "Single Course Plan",
    description: "Access to any one course of your choice.",
    price: "$10",
    amount: 1000,
    features: [
      "1 course access",
      "No recurring fees",
      "Lifetime access to selected course"
    ]
  },
  {
    id: '3',
    title: "Three Courses Plan",
    description: "Access to any three courses of your choice.",
    price: "$25",
    amount: 2500,
    features: [
      "3 courses access",
      "No recurring fees",
      "Lifetime access to selected courses"
    ]
  },
  {
    id: '10',
    title: "Ten Courses Plan",
    description: "Access to any ten courses of your choice.",
    price: "$60",
    amount: 6000,
    features: [
      "10 courses access",
      "No recurring fees",
      "Lifetime access to selected courses"
    ]
  },
];

const CheckoutModal = ({ open, plan, onClose }) => {
  const [showRedirectMsg, setShowRedirectMsg] = useState(false);
  const [redirectCourseId, setRedirectCourseId] = useState(null);

  const handleAfterPayment = () => {
    const courseId = localStorage.getItem('redirectAfterPaymentCourseId');
    if (courseId) {
      setShowRedirectMsg(true);
      setRedirectCourseId(courseId);
      localStorage.removeItem('redirectAfterPaymentCourseId');
      setTimeout(() => {
        window.location.href = `/course/${courseId}`;
      }, 2000);
    } else {
      onClose();
    }
  };

  if (!open || !plan) return null;
  return (
    <div className="confirmation-modal-overlay">
      <div className="confirmation-modal modal-glass modal-pop">
        <div className="modal-header-row">
          <span className="modal-title-icon">
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" className="lock-animate">
              <rect x="5" y="11" width="14" height="8" rx="2" fill="#e3cfa4"/>
              <path d="M8 11V8a4 4 0 118 0v3" stroke="#b5a079" strokeWidth="2"/>
            </svg>
          </span>
          <h3 className="modal-title">Secure payments</h3>
          <button className="close-modal-btn" onClick={onClose} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 18 18" className="close-x-animate">
              <circle cx="9" cy="9" r="8" fill="#fffbe9" />
              <path d="M5.5 5.5l7 7M12.5 5.5l-7 7" stroke="#b5a079" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        <span className="modal-title-decor"></span>
        {showRedirectMsg ? (
          <div style={{textAlign: 'center', padding: '2rem'}}>
            {redirectCourseId && (
              <>
                <button
                  style={{marginTop: '1.5rem', padding: '12px 28px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer'}}
                  onClick={() => window.location.href = `/course/${redirectCourseId}`}
                >
                  Go to Course Now
                </button>
                <button
                  style={{marginTop: '1.5rem', padding: '12px 28px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer'}}
                  onClick={onClose}
                >
                  Back to Home
                </button>
              </>
            )}
          </div>
        ) : (
          <CheckoutForm plan={plan} onSuccess={handleAfterPayment} />
        )}
      </div>
    </div>
  );
};

const SubscriptionPlans = () => {
  const location = useLocation();
  const courseId = location.state?.courseId;
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const handleSubscribe = (plan) => {
    setSelectedPlan(courseId ? { ...plan, courseId } : plan);
    setModalOpen(true);
  };

  return (
    <div className="subscription-plans-container" style={{ marginTop: '90px' }}>
      <div className="subscription-header" style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#b5a079', marginBottom: '0.7rem', letterSpacing: '1px', textShadow: '0 2px 12px #e3cfa4' }}>
          Choose Your <span style={{ color: '#7d6a4d', textShadow: 'none' }}>Subscription Plan</span>
        </h1>
        <p style={{ fontSize: '1.18rem', color: '#7d6a4d', maxWidth: 650, margin: '0 auto', fontWeight: 500, lineHeight: 1.7, background: 'linear-gradient(90deg, #fffbe9 0%, #e3cfa4 100%)', borderRadius: 12, padding: '1.1rem 1.5rem', boxShadow: '0 2px 12px #e3cfa422' }}>
          Select the plan that best fits your learning goals.<br />
          <span style={{ color: '#b5a079', fontWeight: 700 }}>All plans are one-time payments</span> and give you <span style={{ color: '#10b981', fontWeight: 700 }}>lifetime access</span> to the selected courses.
        </p>
      </div>
      <div className="plans-list">
        {plans.map((plan, idx) => (
          <div
            className={`plan-card${idx === 1 ? ' popular' : ''}`}
            key={plan.id}
            style={idx === 1 ? { position: 'relative', paddingTop: '4.2rem' } : {}}
          >
            {idx === 1 && (
              <div
                className="popular-badge"
                style={{
                  position: 'absolute',
                  top: '18px',
                  right: '18px',
                  left: 'unset',
                  margin: 0,
                  background: 'linear-gradient(135deg, #b5a079, #7d6a4d)',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  letterSpacing: '0.5px',
                  zIndex: 3,
                  padding: '0.4rem 1.1rem',
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px 0 rgba(181,160,121,0.13)',
                  border: '2px solid #f5f1eb',
                  width: 'fit-content',
                }}
              >
                Most Popular
              </div>
            )}
            <div className="plan-header">
              <h2>{plan.title}</h2>
              <p>{plan.description}</p>
            </div>
            <div className="plan-price">
              <span className="amount">{plan.price}</span>
            </div>
            <div className="plan-features">
              <ul>
                {plan.features.map((feature, i) => (
                  <li key={i}>
                    <span className="check-icon">✔</span> {feature}
                  </li>
                ))}
              </ul>
            </div>
            <button
              className="subscribe-btn"
              onClick={() => handleSubscribe(plan)}
            >
              Confirm Subscription
            </button>
          </div>
        ))}
      </div>
      <CheckoutModal open={modalOpen} plan={selectedPlan} onClose={() => setModalOpen(false)} />
    </div>
  );
};

export default SubscriptionPlans; 