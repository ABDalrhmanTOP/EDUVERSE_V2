import React, { useState } from "react";
import { FaArrowLeft, FaQuestionCircle, FaLightbulb } from "react-icons/fa";
import Lottie from "lottie-react";
import successAnimation from "../animations/success.json";
import errorAnimation from "../animations/error.json";
import axios from "../api/axios";
import "../styles/CodeTask.css";

const CodeTaskMCQ = ({ task, onTaskComplete, onReturn }) => {
  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Improved options parsing logic
  let parsedOptions = {};
  try {
    // Handle different possible formats of task.options
    if (typeof task.options === 'string') {
      // If it's a JSON string, parse it
      parsedOptions = JSON.parse(task.options || "{}");
    } else if (Array.isArray(task.options)) {
      // If it's an array, convert to object format
      parsedOptions = task.options.reduce((acc, option, index) => {
        acc[String.fromCharCode(65 + index)] = option; // A, B, C, D...
        return acc;
      }, {});
    } else if (typeof task.options === 'object' && task.options !== null) {
      // If it's already an object, use it directly
      parsedOptions = task.options;
    } else {
      // Fallback to empty object
      parsedOptions = {};
    }
  } catch (e) {
    console.warn("Unable to parse MCQ options:", e, "Task options:", task.options);
    parsedOptions = {};
  }

  // Debug logging
  console.log("Task:", task);
  console.log("Parsed options:", parsedOptions);

  const handleAnswer = async (chosenKey) => {
    if (isSubmitting) return; // Prevent multiple submissions
    
    setSelectedAnswer(chosenKey);
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.post(
        "/user-progress/answer",
        {
          task_id: task.id,
          answer: chosenKey,
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
        const newCount = wrongAttempts + 1;
        setWrongAttempts(newCount);
        let msg = "❌ Incorrect answer. Please try again.";
        if (newCount >= 2 && task.syntax_hint) {
          msg += `\n💡 Hint: ${task.syntax_hint}`;
        }
        setFeedback({
          type: "error",
          message: msg,
        });
        // Reset selection after a short delay
        setTimeout(() => setSelectedAnswer(null), 1500);
      }
    } catch (error) {
      console.error("Error submitting answer:", error);
      // Fallback to client-side checking if API fails
      if (String(chosenKey) === String(task.expected_output)) {
        setFeedback({
          type: "success",
          message: "✅ Correct! Well done! Returning to the course..."
        });
        setTimeout(() => onTaskComplete(), 2000);
      } else {
        const newCount = wrongAttempts + 1;
        setWrongAttempts(newCount);
        let msg = "❌ Incorrect answer. Please try again.";
        if (newCount >= 2 && task.syntax_hint) {
          msg += `\n💡 Hint: ${task.syntax_hint}`;
        }
        setFeedback({
          type: "error",
          message: msg,
        });
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
        <div className="task-type-badge">
          <FaQuestionCircle /> Multiple Choice Question
        </div>
        <h3 className="task-title">{task.title}</h3>
        <p className="task-prompt">{task.prompt}</p>
      </div>

      <div className="mcq-question-container">
        <div className="mcq-instructions">
          <FaLightbulb className="instruction-icon" />
          <span>Select the correct answer from the options below</span>
        </div>
        
        <div className="mcq-options">
          {Object.entries(parsedOptions).length > 0 ? (
            Object.entries(parsedOptions).map(([key, value]) => (
              <button
                key={key}
                onClick={() => handleAnswer(key)}
                className={`mcq-option-button ${selectedAnswer === key ? "selected" : ""} ${isSubmitting ? "disabled" : ""}`}
                disabled={isSubmitting}
              >
                <div className="mcq-option-content">
                  <span className="mcq-option-key">{key})</span>
                  <span className="mcq-option-text">{value}</span>
                </div>
              </button>
            ))
          ) : (
            <div className="no-options-message">
              <p>⚠️ No options available for this question.</p>
              <p>Please contact support if this issue persists.</p>
            </div>
          )}
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

export default CodeTaskMCQ;
