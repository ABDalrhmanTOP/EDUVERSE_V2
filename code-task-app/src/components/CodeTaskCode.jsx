// components/CodeTaskCode.jsx
import React, { useState } from "react";
import MonacoEditor from "@monaco-editor/react";
import axios from "axios";
import Lottie from "lottie-react";
import successAnimation from "../animations/success.json";
import errorAnimation from "../animations/error.json";
import "../styles/CodeTask.css";

axios.defaults.baseURL = "http://127.0.0.1:8000/api";

const CodeTaskCode = ({ task, onTaskComplete }) => {
  const [code, setCode] = useState("");
  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const [isLoading, setIsLoading] = useState(false);
  // For dark mode we use "custom-dark", for light we use "vs-light"
  const [editorTheme, setEditorTheme] = useState("custom-dark");

  // onMount: define our custom dark theme for Monaco
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
        {
          code: code,
          language_id: 54,
          task_id: task.id,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const { success, error, details } = response.data;
      if (success) {
        setFeedback({
          type: "success",
          message: "✅ Correct! Returning to the course...",
        });
        setTimeout(() => onTaskComplete(), 2000);
      } else {
        setFeedback({
          type: "error",
          message: `❌ ${error}.\nDetails: ${details}`,
        });
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "Unknown error occurred";
      const errorDetails = error.response?.data?.details || "";
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
    // Dynamically add a class for light or dark mode
    <div className={`code-task-container ${editorTheme === "vs-light" ? "light-mode" : "dark-mode"}`}>
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
            bracketPairColorization: {
              enabled: true,
              independentColorPool: true,
            },
            semanticHighlighting: { enabled: true },
            scrollbar: {
              vertical: "auto",
              horizontal: "auto",
              handleMouseWheel: true,
            },
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

export default CodeTaskCode;
