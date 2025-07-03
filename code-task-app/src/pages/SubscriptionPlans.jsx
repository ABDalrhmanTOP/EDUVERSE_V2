import React, { useState } from "react";
import CheckoutForm from "../components/CheckoutForm";
import "../styles/SubscriptionPlans.css";
import axios from "axios";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe("pk_test_51Re9HPC6InkpE6BbDySFemIfUDICccZwwtm12tvgrAFLhTDkbSM3De6Uy8t3wcuEglqsFHtbrlByLyX2XFDJIXOz00WbzyaYqO");

const plans = [
  {
    id: 1,
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
    id: 3,
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
    id: 10,
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
  if (!open || !plan) return null;
  return (
    <div className="confirmation-modal-overlay">
      <div className="confirmation-modal">
        <h3>Pay for {plan.title}</h3>
        <p>Amount: <b>{plan.price}</b></p>
        <CheckoutForm plan={plan} onSuccess={onClose} />
        <button className="close-modal-btn" onClick={onClose} style={{marginTop:16}}>Cancel</button>
      </div>
    </div>
  );
};

const SubscriptionPlans = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const handleSubscribe = (plan) => {
    setSelectedPlan(plan);
    setModalOpen(true);
  };

  return (
    <div className="subscription-plans-container">
      <div className="subscription-header">
        <h1>Choose Your Subscription Plan</h1>
        <p>Select the plan that best fits your learning goals. All plans are one-time payments and give you lifetime access to the selected courses.</p>
      </div>
      <div className="plans-list">
        {plans.map((plan, idx) => (
          <div className={`plan-card${idx === 1 ? ' popular' : ''}`} key={plan.id}>
            {idx === 1 && <div className="popular-badge">Most Popular</div>}
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
      <div className="paid-benefits-section">
        <h2>Benefits of Paid Courses</h2>
        <ul className="benefits-list">
          <li><span className="check-icon">✔</span> High-quality, up-to-date course content</li>
          <li><span className="check-icon">✔</span> Lifetime access to purchased courses</li>
          <li><span className="check-icon">✔</span> Downloadable resources and materials</li>
          <li><span className="check-icon">✔</span> Certificate of completion</li>
          <li><span className="check-icon">✔</span> Priority support from instructors</li>
          <li><span className="check-icon">✔</span> Access to exclusive community and Q&A</li>
        </ul>
      </div>
      <CheckoutModal open={modalOpen} plan={selectedPlan} onClose={() => setModalOpen(false)} />
    </div>
  );
};

export default SubscriptionPlans; 