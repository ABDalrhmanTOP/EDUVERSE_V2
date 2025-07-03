import React, { useState, useRef } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from '../api/axios';
import '../styles/CheckoutForm.css';
import Illustration from '../assets/1.svg';
import EduverseLogo from '../assets/eduverse_logo.png';
import { useNavigate } from 'react-router-dom';

const stripePromise = loadStripe("pk_test_51Re9HPC6InkpE6BbDySFemIfUDICccZwwtm12tvgrAFLhTDkbSM3De6Uy8t3wcuEglqsFHtbrlByLyX2XFDJIXOz00WbzyaYqO");

const Spinner = () => (
  <div className="spinner-overlay">
    <div className="spinner"></div>
  </div>
);

const SecurityNotice = () => (
  <div className="security-notice">
    <p>🔒 Your payment is secure and encrypted via Stripe.</p>
  </div>
);

const Toast = ({ message, onClose }) => (
  <div className="checkout-toast animate-toast">
    <span>{message}</span>
    <button className="toast-close-btn" onClick={onClose}>×</button>
  </div>
);

const CheckoutFormInner = ({ plan, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const payBtnRef = useRef();
  const successAudio = useRef(null);
  const errorAudio = useRef(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (success) {
      setShowToast(true);
      if (successAudio.current) successAudio.current.play();
      const timer = setTimeout(() => setShowToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  React.useEffect(() => {
    if (error && errorAudio.current) errorAudio.current.play();
  }, [error]);

  if (!plan) {
    return <div style={{padding: '2rem', textAlign: 'center', color: '#b91c1c'}}>No plan selected.</div>;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsProcessing(true);
    setError(null);
    // Animate button
    if (payBtnRef.current) {
      payBtnRef.current.classList.add('btn-pressed');
      setTimeout(() => payBtnRef.current.classList.remove('btn-pressed'), 180);
    }
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
        if (onSuccess) onSuccess();
      } else {
        setError(response.data.message || "Payment failed. Please try again.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Payment failed. Please try again.");
    }
    setIsProcessing(false);
  };

  if (success) {
    return <SuccessCelebration plan={plan} />;
  }

  return (
    <div className="checkout-bg animated-gradient-bg">
      <div className="checkout-form-container fade-in" style={{position:'relative'}}>
        <audio ref={successAudio} src={require('../assets/success-221935.mp3')} preload="auto" />
        <audio ref={errorAudio} src={require('../assets/success-221935.mp3')} preload="auto" />
        {isProcessing && <Spinner />}
        <img src={Illustration} alt="Checkout Illustration" className="checkout-illustration" />
        <div className="checkout-welcome">
          <h1 className="checkout-title">Welcome to EDUVERSE</h1>
          <p className="checkout-subtitle">Complete your payment securely and unlock your learning journey!</p>
        </div>
        <form onSubmit={handleSubmit} className="checkout-form">
          <div className="checkout-header">
            <h2>Checkout</h2>
          </div>
          <div className="plan-summary">
            <h3>{plan.title}</h3>
            <p className="plan-price">{plan.price}</p>
          </div>
          <div className="card-element-container" style={{marginBottom:16}}>
            <CardElement options={{ hidePostalCode: true }} />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button ref={payBtnRef} type="submit" className="pay-button" disabled={!stripe || isProcessing}>
            {isProcessing ? "Processing..." : `Pay ${plan.price}`}
          </button>
          <SecurityNotice />
        </form>
        {showToast && <Toast message={`Purchase confirmed! You are now subscribed to ${plan.title}.`} onClose={() => setShowToast(false)} />}
      </div>
    </div>
  );
};

const CheckoutForm = ({ plan, onSuccess }) => (
  <Elements stripe={stripePromise}>
    <CheckoutFormInner plan={plan} onSuccess={onSuccess} />
  </Elements>
);

export default CheckoutForm;

/*
CSS additions (add to CheckoutForm.css if not present):
.spinner-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(255,255,255,0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}
.spinner {
  border: 4px solid #e5e7eb;
  border-top: 4px solid #6366f1;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
.checkout-error {
  color: #b91c1c;
  background: #fee2e2;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  text-align: center;
}
.checkout-success {
  color: #10b981;
  background: #f0fdf4;
  border-radius: 12px;
  padding: 2rem 1.5rem;
  text-align: center;
  font-size: 1.2rem;
}
.success-icon {
  font-size: 2.5rem;
  color: #10b981;
  margin-bottom: 1rem;
}
.fade-in {
  animation: fadeIn 0.7s cubic-bezier(0.4,0,0.2,1);
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: none; }
}
.animate-pop {
  animation: popAnim 0.5s cubic-bezier(0.4,0,0.2,1);
}
@keyframes popAnim {
  0% { transform: scale(0.7); opacity: 0; }
  60% { transform: scale(1.15); opacity: 1; }
  100% { transform: scale(1); }
}
.btn-pressed {
  transform: scale(0.93);
  box-shadow: 0 2px 8px 0 rgba(200,159,156,0.18);
}
.checkout-toast {
  position: fixed;
  top: 30px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #C89F9C 0%, #6B4F4B 100%);
  color: #fff;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  box-shadow: 0 8px 32px 0 rgba(200,159,156,0.18);
  z-index: 9999;
  display: flex;
  align-items: center;
  gap: 1rem;
}
.animate-toast {
  animation: fadeIn 0.7s cubic-bezier(0.4,0,0.2,1);
}
.toast-close-btn {
  background: none;
  border: none;
  color: #fff;
  font-size: 1.3rem;
  cursor: pointer;
  margin-left: 1rem;
  font-weight: bold;
}
*/ 

// Add a simple confetti effect for success
function ConfettiEffect() {
  React.useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.className = 'confetti-canvas';
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    let W = window.innerWidth, H = window.innerHeight;
    canvas.width = W; canvas.height = H;
    let particles = Array.from({length: 80}, () => ({
      x: Math.random() * W,
      y: Math.random() * -H,
      r: Math.random() * 6 + 4,
      d: Math.random() * 80 + 40,
      color: `hsl(${Math.random()*360},70%,70%)`,
      tilt: Math.random() * 10 - 10
    }));
    let angle = 0;
    function draw() {
      ctx.clearRect(0,0,W,H);
      angle += 0.01;
      for (let i=0; i<particles.length; i++) {
        let p = particles[i];
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI*2, false);
        ctx.fillStyle = p.color;
        ctx.fill();
        p.y += Math.cos(angle+p.d) + 1 + p.r/2;
        p.x += Math.sin(angle) * 2;
        if (p.y > H) {
          p.x = Math.random()*W;
          p.y = Math.random()*-20;
        }
      }
      requestAnimationFrame(draw);
    }
    draw();
    return () => { document.body.removeChild(canvas); };
  }, []);
  return null;
}

function isArabic() {
  // يمكن تحسينها لاحقاً حسب إعدادات المستخدم
  return document.documentElement.dir === 'rtl' || navigator.language.startsWith('ar');
}

function SuccessCelebration({ plan }) {
  const navigate = useNavigate();
  const arabic = isArabic();
  return (
    <div className={`checkout-success checkout-form-container fade-in${arabic ? ' rtl' : ''}`} style={{position:'relative'}}>
      <ConfettiEffect />
      <img src={EduverseLogo} alt="EDUVERSE Logo" className="checkout-logo animate-pop" style={{width:90, marginBottom:18}} />
      <div className="success-icon animate-pop" style={{fontSize: '3.5rem', color:'#10b981', margin:'0 auto 1rem'}}>
        <span role="img" aria-label="success">🎉</span>
      </div>
      <h2 style={{color:'#6B4F4B', fontWeight:700, fontSize:'2rem', marginBottom:8}}>
        {arabic ? 'تم الدفع بنجاح!' : 'Payment Successful!'}
      </h2>
      <p style={{fontSize:'1.15rem', color:'#374151', marginBottom:6}}>
        {arabic ? 'شكرًا لاشتراكك في' : 'Thank you for subscribing to'} <b>{plan.title}</b>
      </p>
      <p style={{color:'#A97C78', marginBottom:18}}>
        {arabic ? 'تم تفعيل اشتراكك بنجاح. نتمنى لك رحلة تعليمية ممتعة في EDUVERSE!' : 'Your subscription is now active. Enjoy your learning journey with EDUVERSE!'}
      </p>
      <button className="pay-button animate-pop" style={{maxWidth:260, margin:'0 auto', display:'block'}} onClick={()=>navigate('/')}> 
        {arabic ? 'العودة للرئيسية' : 'Back to Home'}
      </button>
    </div>
  );
} 