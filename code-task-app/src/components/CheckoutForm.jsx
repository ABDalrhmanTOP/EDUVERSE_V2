import React, { useState, useRef, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from '../api/axios';
import '../styles/CheckoutForm.css';
import { useNavigate } from 'react-router-dom';
import SuccessCelebration from './SuccessCelebration';
import { FaLock, FaCreditCard, FaExclamationCircle, FaCheckCircle, FaCrown, FaRocket, FaGift, FaShieldAlt, FaStar } from 'react-icons/fa';
import Spinner from './Spinner';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_KEY);

const CheckoutFormInner = ({ plan, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const navigate = useNavigate();

  // Debug effect to monitor success state changes
  useEffect(() => {
    console.log('Success state changed to:', success);
  }, [success]);

  if (!plan) {
    return <div style={{padding: '2rem', textAlign: 'center', color: '#b91c1c'}}>No plan selected.</div>;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsProcessing(true);
    setError(null);

    if (!stripe || !elements) {
      setError("Stripe is not loaded.");
      setIsProcessing(false);
      return;
    }

    const cardElement = elements.getElement(CardElement);
    const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card: cardElement,
    });

    if (stripeError) {
      setError(stripeError.message);
      setIsProcessing(false);
      return;
    }

    try {
      const response = await axios.post('/checkout', {
        payment_method_id: paymentMethod.id,
        amount: plan.amount,
        plan_name: plan.title,
        planId: plan.id,
      });

      console.log('Payment response:', response.data);

      if (response.data.success) {
        console.log('Payment successful, setting success to true');
        setSuccess(true);
        if (onSuccess) onSuccess();
        
        // Force re-render after a short delay to ensure state update
        setTimeout(() => {
          setSuccess(true);
        }, 100);
      } else {
        console.log('Payment failed:', response.data.message);
        setError(response.data.message || "Payment failed. Please try again.");
      }
    } catch (err) {
      console.log('Payment error:', err);
      setError(err.response?.data?.message || "Payment failed. Please try again.");
    }
    setIsProcessing(false);
  };

  // Subscription confirmation component
  const SubscriptionConfirmation = ({ plan }) => {
    const [showDetails, setShowDetails] = useState(false);
    
    return (
      <div className="subscription-confirmation-overlay">
        <div className="subscription-confirmation-modal glassy fade-in-up">
          <div className="confirmation-header">
            <div className="success-icon-container">
              <FaCrown className="success-icon" />
            </div>
            <h2 className="confirmation-title">Your subscription has been confirmed successfully! 🎉</h2>
            <p className="confirmation-subtitle">Welcome to the EduVerse educational family</p>
          </div>
          
          <div className="plan-confirmation-details">
            <div className="confirmed-plan-card">
              <div className="plan-header">
                <FaRocket className="plan-icon" />
                <h3>{plan.title}</h3>
              </div>
              <div className="plan-price-confirmed accent">{plan.price}</div>
              <div className="plan-features">
                <h4>Included Features:</h4>
                <ul>
                  <li><FaGift /> Full access to educational content</li>
                  <li><FaGift /> Premium technical support</li>
                  <li><FaGift /> Free updates</li>
                  <li><FaGift /> Course completion certificate</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="next-steps">
            <h4>Next Steps:</h4>
            <div className="steps-list">
              <div className="step-item">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h5>Explore Content</h5>
                  <p>Start your learning journey by browsing available courses</p>
                </div>
              </div>
              <div className="step-item">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h5>Track Progress</h5>
                  <p>Monitor your learning progress through the dashboard</p>
                </div>
              </div>
              <div className="step-item">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h5>Get Support</h5>
                  <p>Contact our technical support team when needed</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="confirmation-actions">
            <button 
              className="primary-action-btn gradient-btn"
              onClick={() => navigate('/dashboard')}
            >
              <FaRocket /> Start Learning Now
            </button>
            <button 
              className="secondary-action-btn"
              onClick={() => navigate('/subscription-history')}
            >
              View Subscription History
            </button>
          </div>
          
          <div className="welcome-message">
            <p>🎓 Welcome to the world of advanced digital learning!</p>
            <p>We're excited to help you achieve your educational goals</p>
          </div>
        </div>
      </div>
    );
  };

  // Payment confirmation component
  const PaymentConfirmation = ({ plan }) => {
    return (
      <div className="payment-confirmation-overlay">
        <div className="payment-confirmation-modal glassy fade-in-up">
          <div className="confirmation-header">
            <div className="success-icon-container">
              <FaCheckCircle className="success-icon" />
            </div>
            <h2 className="confirmation-title">Payment Successful! 🎉</h2>
            <p className="confirmation-subtitle">Thank you for your subscription</p>
          </div>
          
          <div className="plan-confirmation-details">
            <div className="confirmed-plan-card">
              <div className="plan-header">
                <FaCrown className="plan-icon" />
                <h3>{plan.title}</h3>
              </div>
              <div className="plan-price-confirmed">{plan.price}</div>
              <div className="plan-features">
                <h4>Your subscription includes:</h4>
                <ul>
                  <li><FaStar /> Full access to selected courses</li>
                  <li><FaShieldAlt /> Secure and encrypted platform</li>
                  <li><FaGift /> Lifetime access to content</li>
                  <li><FaRocket /> Premium learning experience</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="confirmation-actions">
            <button 
              className="primary-action-btn gradient-btn"
              onClick={() => navigate('/dashboard')}
            >
              <FaRocket /> Start Learning Now
            </button>
            <button 
              className="secondary-action-btn"
              onClick={() => navigate('/subscription-history')}
            >
              View Subscription History
            </button>
          </div>
          
          <div className="welcome-message">
            <p>🎓 Welcome to EduVerse! Your learning journey begins now.</p>
            <p>We're excited to help you achieve your educational goals.</p>
          </div>
        </div>
      </div>
    );
  };

  console.log('Current success state:', success);
  console.log('Component re-rendering, success =', success);
  
  if (success) {
    console.log('Rendering PaymentConfirmation');
    return <PaymentConfirmation plan={plan} />;
  }

  return (
    <div className="checkout-bg">
      <div className="checkout-form-container glassy fade-in-up">
        <div className="checkout-welcome">
          <p className="checkout-subtitle">Complete your payment securely and unlock your learning journey!</p>
        </div>
        <form onSubmit={handleSubmit} className="checkout-form">
          <div className="checkout-header" style={{ textAlign: 'center' }}>
            <h2 className="checkout-title checkout-title-gradient">Checkout</h2>
          </div>
          <div className="plan-summary card-style plan-summary-centered">
            <h3>{plan.title}</h3>
            <p className="plan-price accent">{plan.price}</p>
          </div>
          <div className="card-element-container card-input-glass">
            <CardElement options={{ hidePostalCode: true }} />
          </div>
          {error && (
            <div className="error-message">
              <FaExclamationCircle style={{ marginRight: 8, color: '#dc2626' }} />
              {error}
            </div>
          )}
          <button type="submit" className="pay-button gradient-btn" disabled={!stripe || isProcessing}>
            {isProcessing ? <Spinner className="inline-spinner" /> : `Pay ${plan.price}`}
          </button>
          <div className="security-notice">
            <FaLock className="security-lock-icon" />
            Your payment is <span className="security-accent">secure</span> and encrypted via <span className="security-accent">Stripe</span>
          </div>
        </form>
      </div>
    </div>
  );
};

const CheckoutForm = ({ plan, onSuccess }) => (
  <Elements stripe={stripePromise} options={{ locale: "en" }}>
    <CheckoutFormInner plan={plan} onSuccess={onSuccess} />
  </Elements>
);

export default CheckoutForm;


