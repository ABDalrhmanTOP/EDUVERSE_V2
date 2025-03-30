// src/components/CodeTaskCode.jsx
import React, { useState } from "react";
import MonacoEditor from "@monaco-editor/react";
import axios from "axios";
import { FaArrowLeft } from "react-icons/fa";
import Lottie from "lottie-react";
import successAnimation from "../animations/success.json";
import errorAnimation from "../animations/error.json";
import "../styles/CodeTask.css";

// Adjust if necessary for your dev environment:
axios.defaults.baseURL = "http://127.0.0.1:8000/api";

const CodeTaskCode = ({ task, onTaskComplete, onReturn = () => {} }) => {
  const [code, setCode] = useState("");
  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [editorTheme, setEditorTheme] = useState("custom-dark");

  const handleEditorMount = (editor, monaco) => {
    monaco.editor.defineTheme("custom-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "keyword", foreground: "c678dd" },
        { token: "number", foreground: "d19a66" },
        { token: "string", foreground: "98c379" },
        { token: "comment", foreground: "5c6370", fontStyle: "italic" },
        { token: "identifier", foreground: "e06c75" },
        { token: "operator", foreground: "abb2bf" },
        { token: "function", foreground: "61afef" },
        { token: "type", foreground: "e5c07b" },
      ],
      colors: {
        "editor.background": "#1e1e1e",
        "editor.foreground": "#abb2bf",
        "editor.lineHighlightBackground": "#2a2a2a",
        "editorCursor.foreground": "#528bff",
      },
    });
    monaco.editor.setTheme(editorTheme);
  };

  const handleTestCode = async () => {
    if (!code.trim()) {
      setFeedback({
        type: "error",
        message: "⚠️ Please enter your code before submitting.",
      });
      return;
    }
    setIsLoading(true);
    setFeedback({});

    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.post(
        "/evaluate-code",
        { code, language_id: 54, task_id: task.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { success, error, details, expected, received } = response.data;

      if (success) {
        setFeedback({
          type: "success",
          message: "✅ Correct! Returning to the course..."
        });
        // After 2s, call onTaskComplete to close the task overlay
        setTimeout(() => onTaskComplete(), 2000);
      } else {
        const newAttempts = wrongAttempts + 1;
        setWrongAttempts(newAttempts);
        // Show both "expected" and "received" if they exist
        setFeedback({
          type: "error",
          message: `❌ Incorrect output.\nYour Output: ${
            received || "Not available"
          }\nExpected Output: ${expected || "Not available"}`
        });
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || "Unknown error occurred";
      const errorDetails = err.response?.data?.details || "";
      setFeedback({
        type: "error",
        message: `Error submitting code: ${errorMessage}.\n${errorDetails}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTheme = () => {
    const newTheme = editorTheme === "custom-dark" ? "vs-light" : "custom-dark";
    setEditorTheme(newTheme);

    if (window.monaco) {
      window.monaco.editor.setTheme(newTheme);
    }
  };

  return (
    <div
      className={`code-task-container ${
        editorTheme === "vs-light" ? "light-mode" : "dark-mode"
      }`}
    >
      <h3>{task.title}</h3>
      <p>{task.prompt}</p>

      <div className="theme-toggle-container">
        <button className="theme-toggle-button" onClick={toggleTheme}>
          {editorTheme === "custom-dark" ? "☀️ Light Theme" : "🌙 Dark Theme"}
        </button>
      </div>

      <div className="editor-wrapper">
        <MonacoEditor
          width="100%"
          height="100%"
          language="cpp"
          theme={editorTheme}
          value={code}
          onChange={setCode}
          onMount={handleEditorMount}
          options={{
            fontSize: 15,
            lineHeight: 24,
            fontFamily: "Fira Code, monospace",
            fontWeight: "500",
            mouseWheelZoom: true,
            scrollBeyondLastLine: false,
            roundedSelection: true,
            padding: { top: 20 },
            contextmenu: true,
            lineNumbers: "on",
            folding: true,
            renderLineHighlight: "all",
            wordWrap: "on",
            formatOnPaste: true,
            minimap: { enabled: false },
            automaticLayout: true,
            bracketPairColorization: { enabled: true, independentColorPool: true },
            semanticHighlighting: { enabled: true },
            scrollbar: { vertical: "auto", horizontal: "auto", handleMouseWheel: true },
            cursorBlinking: "smooth",
            cursorSmoothCaretAnimation: "on",
            cursorStyle: "line",
            cursorWidth: 2,
            fontLigatures: true,
          }}
        />
      </div>

      <div className="submit-button-container">
        <button
          className="submit-button"
          onClick={handleTestCode}
          disabled={isLoading}
        >
          {isLoading ? "Testing..." : "Submit Code"}
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
            <Lottie
              animationData={successAnimation}
              style={{ width: 200, height: 200 }}
            />
          ) : (
            <Lottie
              animationData={errorAnimation}
              style={{ width: 150, height: 150 }}
            />
          )}

          <p className="feedback-message">{feedback.message}</p>

          {wrongAttempts >= 3 && (
            <pre className="hint-code">
              <strong>Hint:</strong> {task.syntax_hint}
            </pre>
          )}

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

export default CodeTaskCode;
