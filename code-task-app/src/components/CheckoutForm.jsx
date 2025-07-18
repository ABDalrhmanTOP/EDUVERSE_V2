import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from '../api/axios';
import '../styles/CheckoutForm.css';
import { useNavigate } from 'react-router-dom';
import Spinner from './Spinner';
import { FaLock, FaExclamationCircle } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SuccessCelebration from './SuccessCelebration';

const stripePromise = loadStripe("pk_test_51Re9HPC6InkpE6BbDySFemIfUDICccZwwtm12tvgrAFLhTDkbSM3De6Uy8t3wcuEglqsFHtbrlByLyX2XFDJIXOz00WbzyaYqO");

const CheckoutFormInner = ({ plan, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  // عند نجاح الدفع، أظهر Toast ثم أعد التوجيه
  useEffect(() => {
    if (success) {
      toast.success('Subscription successful! 🎉', {
        position: 'top-center',
        autoClose: 2500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      
    }
  }, [success, navigate]);

  if (!plan) {
    return <div style={{padding: '2rem', textAlign: 'center', color: '#b91c1c'}}>No plan selected.</div>;
  }

  // معالجة الدفع
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

      if (response.data.success) {
        setSuccess(true);
        
      } else {
        setError(response.data.message || "Payment failed. Please try again.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Payment failed. Please try again.");
    }
    setIsProcessing(false);
  };

  // عند النجاح، أظهر Toast فقط
  if (success) {
    return <SuccessCelebration plan={plan} />;
  }

  return (
    <>
   
      <div className="checkout-bg">
        <div className="checkout-form-container glassy fade-in-up">
          <div className="checkout-welcome">
            <p className="checkout-subtitle">Complete your payment securely and start your learning journey!</p>
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
    </>
  );
};

const CheckoutForm = ({ plan, onSuccess }) => (
  <Elements stripe={stripePromise} options={{ locale: "en" }}>
    <CheckoutFormInner plan={plan} onSuccess={onSuccess} />
  </Elements>
);

export default CheckoutForm;


