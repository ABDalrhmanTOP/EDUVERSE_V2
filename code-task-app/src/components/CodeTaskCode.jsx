import React, { useState } from "react";
import AceEditor from "react-ace";
import axios from "axios";
import "ace-builds/src-noconflict/mode-c_cpp";
import "ace-builds/src-noconflict/theme-monokai";
import Lottie from "lottie-react";
import successAnimation from "../animations/success.json";
import errorAnimation from "../animations/error.json";
import "../styles/CodeTask.css";

axios.defaults.baseURL = "http://127.0.0.1:8000/api";

const CodeTaskCode = ({ task, onTaskComplete }) => {
  const [code, setCode] = useState("");
  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const [isLoading, setIsLoading] = useState(false);

  const handleTestCode = async () => {
    if (!code.trim()) {
      setFeedback({ type: "error", message: "⚠️ Please enter your code before submitting." });
      return;
    }
    setIsLoading(true);
    setFeedback({});
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.post(
        "/evaluate-code",
        {
          code: code,
          language_id: 54,
          task_id: task.id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const { success, error, details } = response.data;
      if (success) {
        setFeedback({ type: "success", message: "✅ Correct! Returning to the course..." });
        setTimeout(() => onTaskComplete(), 2000);
      } else {
        setFeedback({
          type: "error",
          message: `❌ ${error}.\nDetails: ${details}`,
        });
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || "Unknown error occurred";
      const errorDetails = error.response?.data?.details || "";
      setFeedback({
        type: "error",
        message: `Error submitting code: ${errorMessage}.\n${errorDetails}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="code-task-container">
      <h3>{task.title}</h3>
      <p>{task.prompt}</p>
      <AceEditor
        mode="c_cpp"
        theme="monokai"
        onChange={(newValue) => setCode(newValue)}
        value={code}
        fontSize={14}
        width="100%"
        height="300px"
        className="ace-editor"
      />
      <div className="submit-button-container">
        <button className="submit-button" onClick={handleTestCode} disabled={isLoading}>
          {isLoading ? "Testing..." : "Submit Code"}
        </button>
      </div>
      {feedback.message && (
        <div className="feedback-modal">
          {isLoading ? (
            <div className="modal-spinner">
              <div className="spinner"></div>
            </div>
          ) : (
            <>
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
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default CodeTaskCode;
