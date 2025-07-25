// src/components/CodeTaskTrueFalse.jsx
import React, { useState } from "react";
import { FaCheckCircle, FaTimesCircle, FaArrowLeft } from "react-icons/fa";
import Lottie from "lottie-react";
import successAnimation from "../animations/success.json";
import errorAnimation from "../animations/error.json";
import "../styles/CodeTask.css";

const CodeTaskTrueFalse = ({ task, onTaskComplete, onReturn }) => {
  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const [wrongAttempts, setWrongAttempts] = useState(0);

  const handleAnswer = (answer) => {
    // For True/False tasks, we do not display expected_output.
    if (String(answer).toLowerCase() === String(task.correct_answer).toLowerCase()) {
      setFeedback({
        type: "success",
        message: "✅ Correct! Returning to the course..."
      });
      setTimeout(() => onTaskComplete(), 2000);
    } else {
      const newAttempts = wrongAttempts + 1;
      setWrongAttempts(newAttempts);
      let msg = "❌ Incorrect answer. Please try again.";
      if (newAttempts >= 3) {
        msg += `\nHint: ${task.syntax_hint}`; // syntax_hint holds the hint and correct answer.
      }
      setFeedback({ type: "error", message: msg });
    }
  };

  return (
    <div className="task-container">
      <h3 className="task-title">{task.title}</h3>
      <p className="task-prompt">{task.prompt}</p>

      <div className="tf-buttons">
        <button className="true" onClick={() => handleAnswer("true")}>
          <FaCheckCircle /> True
        </button>
        <button className="false" onClick={() => handleAnswer("false")}>
          <FaTimesCircle /> False
        </button>
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
        </div>
      )}
    </div>
  );
};

export default CodeTaskTrueFalse;
