// src/components/CodeTaskTrueFalse.jsx
import React, { useState } from "react";
import { FaCheckCircle, FaTimesCircle, FaArrowLeft, FaLightbulb, FaQuestionCircle } from "react-icons/fa";
import Lottie from "lottie-react";
import successAnimation from "../animations/success.json";
import errorAnimation from "../animations/error.json";
import axios from "../api/axios";
import "../styles/CodeTask.css";

const CodeTaskTrueFalse = ({ task, onTaskComplete, onReturn }) => {
  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAnswer = async (answer) => {
    if (isSubmitting) return; // Prevent multiple submissions
    
    setSelectedAnswer(answer);
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.post(
        "/user-progress/answer",
        {
          task_id: task.id,
          answer: answer,
          playlist_id: task.playlist_id
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.correct) {
        setFeedback({
          type: "success",
          message: "✅ Correct! Well done! Returning to the course..."
        });
        setTimeout(() => onTaskComplete(), 2000);
      } else {
        const newAttempts = wrongAttempts + 1;
        setWrongAttempts(newAttempts);
        let msg = "❌ Incorrect answer. Please try again.";
        if (newAttempts >= 2 && task.syntax_hint) {
          msg += `\n💡 Hint: ${task.syntax_hint}`;
        }
        setFeedback({ type: "error", message: msg });
        // Reset selection after a short delay
        setTimeout(() => setSelectedAnswer(null), 1500);
      }
    } catch (error) {
      console.error("Error submitting answer:", error);
      // Fallback to client-side checking if API fails
      if (String(answer).toLowerCase() === String(task.expected_output).toLowerCase()) {
        setFeedback({
          type: "success",
          message: "✅ Correct! Well done! Returning to the course..."
        });
        setTimeout(() => onTaskComplete(), 2000);
      } else {
        const newAttempts = wrongAttempts + 1;
        setWrongAttempts(newAttempts);
        let msg = "❌ Incorrect answer. Please try again.";
        if (newAttempts >= 2 && task.syntax_hint) {
          msg += `\n💡 Hint: ${task.syntax_hint}`;
        }
        setFeedback({ type: "error", message: msg });
        // Reset selection after a short delay
        setTimeout(() => setSelectedAnswer(null), 1500);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTryAgain = () => {
    setFeedback({});
    setSelectedAnswer(null);
  };

  return (
    <div className="task-container">
      <div className="task-header">
        <h3 className="task-title">{task.title}</h3>
        <p className="task-prompt">{task.prompt}</p>
      </div>

      <div className="tf-question-container">
        <div className="tf-instructions">
          <FaLightbulb className="instruction-icon" />
          <span>Select whether the statement is True or False</span>
        </div>
        
        <div className="tf-buttons">
          <button 
            className={`tf-button true ${selectedAnswer === "true" ? "selected" : ""} ${isSubmitting ? "disabled" : ""}`}
            onClick={() => handleAnswer("true")}
            disabled={isSubmitting}
          >
            <div className="tf-button-content">
              <FaCheckCircle className="tf-icon" />
              <span className="tf-text">True</span>
            </div>
          </button>
          
          <button 
            className={`tf-button false ${selectedAnswer === "false" ? "selected" : ""} ${isSubmitting ? "disabled" : ""}`}
            onClick={() => handleAnswer("false")}
            disabled={isSubmitting}
          >
            <div className="tf-button-content">
              <FaTimesCircle className="tf-icon" />
              <span className="tf-text">False</span>
            </div>
          </button>
        </div>

        {wrongAttempts > 0 && (
          <div className="attempts-counter">
            <span>Attempts: {wrongAttempts}</span>
          </div>
        )}
      </div>

      <div className="return-button-container">
        <button className="return-button" onClick={onReturn}>
          <FaArrowLeft /> Return to Course
        </button>
      </div>

      {feedback.message && (
        <div className="feedback-modal">
          {feedback.type === "success" ? (
            <Lottie animationData={successAnimation} style={{ width: 200, height: 200 }} />
          ) : (
            <Lottie animationData={errorAnimation} style={{ width: 150, height: 150 }} />
          )}
          <p className="feedback-message" style={{ whiteSpace: "pre-line" }}>
            {feedback.message}
          </p>
          {feedback.type === "error" && (
            <button className="try-again-button" onClick={handleTryAgain}>
              Try Again
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default CodeTaskTrueFalse;
