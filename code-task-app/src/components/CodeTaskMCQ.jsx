import React, { useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import Lottie from "lottie-react";
import successAnimation from "../animations/success.json";
import errorAnimation from "../animations/error.json";
import "../styles/CodeTask.css";

const CodeTaskMCQ = ({ task, onTaskComplete, onReturn }) => {
  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const [wrongAttempts, setWrongAttempts] = useState(0);

  let parsedOptions = {};
  try {
    parsedOptions = JSON.parse(task.options || "{}");
  } catch (e) {
    // console.warn("Unable to parse MCQ options as JSON:", e);
  }

  const handleAnswer = (chosenKey) => {
    if (String(chosenKey) === String(task.expected_output)) {
      setFeedback({
        type: "success",
        message: "✅ Correct! Returning to the course..."
      });
      setTimeout(() => onTaskComplete(), 2000);
    } else {
      const newCount = wrongAttempts + 1;
      setWrongAttempts(newCount);
      let msg = "❌ Incorrect answer. Please try again.";
      if (newCount >= 3 && task.syntax_hint) {
        msg += `\nHint: ${task.syntax_hint}`;
      }
      setFeedback({
        type: "error",
        message: msg,
      });
    }
  };

  return (
    <div className="task-container">
      <h3 className="task-title">{task.title}</h3>
      <p className="task-prompt">{task.prompt}</p>

      <div className="mcq-options">
        {Object.entries(parsedOptions).map(([key, value]) => (
          <button
            key={key}
            onClick={() => handleAnswer(key)}
          >
            {key}) {value}
          </button>
        ))}
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
            <button className="try-again-button" onClick={() => setFeedback({})}>
              Try Again
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default CodeTaskMCQ;
