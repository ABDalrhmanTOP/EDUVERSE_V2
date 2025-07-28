// src/components/CodeTaskCode.jsx
import React, { useState, useEffect } from "react";
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
  const [editorError, setEditorError] = useState(false);
  const [editorLoading, setEditorLoading] = useState(true);

  // Cleanup function to prevent memory leaks
  useEffect(() => {
    return () => {
      if (window.monacoEditor) {
        window.monacoEditor.dispose();
        window.monacoEditor = null;
      }
    };
  }, []);

  const handleEditorMount = (editor, monaco) => {
    console.log("Monaco Editor mounted successfully");
    setEditorLoading(false);
    
    // Suppress ResizeObserver errors
    const originalError = console.error;
    console.error = (...args) => {
      if (args[0] && typeof args[0] === 'string' && args[0].includes('ResizeObserver')) {
        return;
      }
      originalError.apply(console, args);
    };

    try {
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
      
      // Store editor reference for cleanup
      window.monacoEditor = editor;
      setEditorError(false);
    } catch (error) {
      console.error("Monaco Editor mount error:", error);
      setEditorError(true);
      setEditorLoading(false);
    }
  };

  const handleEditorError = (error) => {
    console.error("Monaco Editor error:", error);
    setEditorError(true);
    setEditorLoading(false);
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
      
      // Get test cases from the task
      let testCases = [];
      if (task.coding_test_cases) {
        try {
          // Handle different possible formats of test cases
          if (typeof task.coding_test_cases === 'string') {
            testCases = JSON.parse(task.coding_test_cases);
          } else if (Array.isArray(task.coding_test_cases)) {
            testCases = task.coding_test_cases;
          } else {
            testCases = [];
          }
        } catch (e) {
          console.warn("Unable to parse test cases:", e);
          testCases = [];
        }
      }

      // If no test cases are defined, create a simple one based on expected output
      if (testCases.length === 0 && task.expected_output) {
        testCases = [{
          input: "",
          output: task.expected_output
        }];
      }

      // If still no test cases, create a default one
      if (testCases.length === 0) {
        testCases = [{
          input: "",
          output: "Hello, World!"
        }];
      }

      const response = await axios.post(
        "/evaluate-code",
        { 
          source_code: code, 
          language_id: 54, 
          test_cases: testCases 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { success, error, details, results, passed, total } = response.data;

      if (success) {
        setFeedback({
          type: "success",
          message: `✅ Correct! All ${total} test cases passed. Returning to the course...`
        });
        // After 2s, call onTaskComplete to close the task overlay
        setTimeout(() => onTaskComplete(), 2000);
      } else {
        const newAttempts = wrongAttempts + 1;
        setWrongAttempts(newAttempts);
        
        let errorMessage = `❌ Code execution failed.\n`;
        if (error) {
          errorMessage += `Error: ${error}\n`;
        }
        if (details) {
          errorMessage += `Details: ${details}\n`;
        }
        if (results && results.length > 0) {
          errorMessage += `\nTest Results:\n`;
          results.forEach((result, index) => {
            errorMessage += `Test ${index + 1}: ${result.passed ? '✅' : '❌'}\n`;
            if (!result.passed) {
              errorMessage += `  Expected: ${result.expected}\n`;
              errorMessage += `  Got: ${result.actual}\n`;
            }
          });
        }
        
        setFeedback({
          type: "error",
          message: errorMessage
        });
      }
    } catch (err) {
      console.error("Error submitting code:", err);
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
        {editorLoading ? (
          <div className="loading-message">
            Loading Monaco Editor...
          </div>
        ) : editorError ? (
          <textarea
            className="fallback-textarea"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Monaco Editor failed to load. Please enter your code here."
          />
        ) : (
          <MonacoEditor
            width="100%"
            height="100%"
            language="cpp"
            theme={editorTheme}
            value={code}
            onChange={setCode}
            onMount={handleEditorMount}
            onError={handleEditorError}
            options={{
              fontSize: 14,
              lineHeight: 20,
              fontFamily: "Consolas, 'Courier New', monospace",
              fontWeight: "normal",
              mouseWheelZoom: true,
              scrollBeyondLastLine: false,
              roundedSelection: false,
              padding: { top: 10, bottom: 10 },
              contextmenu: true,
              lineNumbers: "on",
              folding: false,
              renderLineHighlight: "line",
              wordWrap: "on",
              formatOnPaste: false,
              minimap: { enabled: false },
              automaticLayout: true, // Re-enable for proper sizing
              bracketPairColorization: { enabled: false },
              semanticHighlighting: { enabled: false },
              scrollbar: { 
                vertical: "auto", 
                horizontal: "auto", 
                handleMouseWheel: true,
                useShadows: false
              },
              cursorBlinking: "blink",
              cursorSmoothCaretAnimation: "off",
              cursorStyle: "line",
              cursorWidth: 1,
              fontLigatures: false,
              // Simplified options to prevent issues
              fixedOverflowWidgets: false,
              overviewRulerBorder: false,
              hideCursorInOverviewRuler: true,
              renderValidationDecorations: "off",
              suggestOnTriggerCharacters: false,
              quickSuggestions: false,
              parameterHints: { enabled: false },
              hover: { enabled: false },
              // Basic editor features only
              readOnly: false,
              tabSize: 4,
              insertSpaces: true,
              detectIndentation: false,
              trimAutoWhitespace: true,
              largeFileOptimizations: false,
            }}
          />
        )}
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
