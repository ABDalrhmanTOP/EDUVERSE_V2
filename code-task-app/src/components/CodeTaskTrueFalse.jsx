import React, { useState } from "react";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import Lottie from "lottie-react";
import successAnimation from "../animations/success.json";
import errorAnimation from "../animations/error.json";
import "../styles/CodeTask.css";

const CodeTaskTrueFalse = ({ task, onTaskComplete }) => {
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const handleAnswer = (answer) => {
    if (String(answer).toLowerCase() === String(task.correctAnswer).toLowerCase()) {
      setFeedback({ type: "success", message: "✅ Correct! Returning to the course..." });
      setTimeout(() => onTaskComplete(), 2000);
    } else {
      setFeedback({ type: "error", message: "❌ Incorrect answer, please try again." });
    }
  };

  return (
    <div className="code-task-container">
      <h3>{task.title}</h3>
      <p>{task.prompt}</p>
      <div className="button-group">
        <button className="btn btn-true" onClick={() => handleAnswer("true")}>
          <FaCheckCircle /> True
        </button>
        <button className="btn btn-false" onClick={() => handleAnswer("false")}>
          <FaTimesCircle /> False
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
            <button className="try-again-button" onClick={() => setFeedback({})}>
              Try Again
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default CodeTaskTrueFalse;
