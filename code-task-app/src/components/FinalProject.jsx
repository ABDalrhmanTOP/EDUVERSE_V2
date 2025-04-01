// src/components/FinalProject.jsx
import React, { useState } from "react";
import axios from "../api/axios";
import MonacoEditor from "@monaco-editor/react";
import "../styles/FinalProject.css";
import { FaStar } from "react-icons/fa";

/* Helper Functions */
function getGradeColor(grade) {
  switch (grade) {
    case "A":
      return "#37b24d"; // green
    case "B":
      return "#99d98c"; // lighter green
    case "C":
      return "#ffd43b"; // yellowish
    case "D":
      return "#ffa94d"; // orange
    case "E":
    case "F":
      return "#fa5252"; // red
    default:
      return "#333";
  }
}

function getMarkColor(mark) {
  return mark === "1/1" ? "#37b24d" : "#fa5252";
}

function getAnswerStyle(answer, correct) {
  return {
    color: answer === correct ? "green" : "red",
    fontWeight: "bold",
  };
}

/**
 * StarRating component using FaStar icons.
 */
const StarRating = ({ onRatingChange }) => {
  const totalStars = 5;
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);

  const handleClick = (value) => {
    setRating(value);
    if (onRatingChange) onRatingChange(value);
  };

  return (
    <div className="star-rating">
      {[...Array(totalStars)].map((_, idx) => {
        const starValue = idx + 1;
        return (
          <FaStar
            key={starValue}
            className="star-icon"
            size={32}
            style={{ cursor: "pointer", marginRight: 8 }}
            color={starValue <= (hover || rating) ? "#FFD700" : "#ccc"}
            onClick={() => handleClick(starValue)}
            onMouseEnter={() => setHover(starValue)}
            onMouseLeave={() => setHover(rating)}
          />
        );
      })}
    </div>
  );
};

const FinalProject = () => {
  const playlistId = 1; // For demonstration
  // State for toggling between user's code and ideal code.
  const [showIdeal, setShowIdeal] = useState(false);
  // States for answers.
  const [mcqAnswers, setMcqAnswers] = useState({ q1: "", q2: "" });
  const [tfAnswers, setTfAnswers] = useState({ q1: "", q2: "" });
  // User coding solution.
  const [codeSolution, setCodeSolution] = useState("");
  // Submission result, error message, and submitting flag.
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Certificate modal state.
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  // Rating & feedback states.
  const [userRating, setUserRating] = useState(0);
  const [feedbackNote, setFeedbackNote] = useState("");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  // Store the user_progress_id from the final project submission.
  const [userProgressId, setUserProgressId] = useState(null);

  // Hardcoded MCQ options.
  const mcqOptionsQ1 = [
    { value: "A", label: "std::set" },
    { value: "B", label: "std::unordered_map" },
    { value: "C", label: "std::map" },
    { value: "D", label: "std::array" },
  ];
  const mcqOptionsQ2 = [
    { value: "A", label: "std::vector" },
    { value: "B", label: "std::deque" },
    { value: "C", label: "std::list" },
    { value: "D", label: "std::forward_list" },
  ];

  // Multi-line coding prompt.
  const codingPrompt =
    "Implement a C++ program that defines:\n" +
    "1) A class Person (with private name & age, plus public getters/setters).\n" +
    "2) A class Student (inherits from Person, with a std::vector<string> of courses and methods addCourse() and printCourses()).\n" +
    "Then in main(), create a Student('John Doe', 21), add 3 courses, and call printInfo() & printCourses().";

  // Toggle ideal code view.
  const toggleIdealCode = () => {
    setShowIdeal((prev) => !prev);
  };

  // Monaco Editor onMount handler.
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
    monaco.editor.setTheme("custom-dark");
  };

  // Validate submission.
  const validateSubmission = () => {
    if (!codeSolution.trim()) {
      setErrorMsg("Please enter your coding solution.");
      return false;
    }
    if (!mcqAnswers.q1 || !mcqAnswers.q2) {
      setErrorMsg("Please answer all multiple choice questions.");
      return false;
    }
    if (!tfAnswers.q1 || !tfAnswers.q2) {
      setErrorMsg("Please answer all true/false questions.");
      return false;
    }
    setErrorMsg("");
    return true;
  };

  const handleMCQChange = (qid, value) => {
    setMcqAnswers((prev) => ({ ...prev, [qid]: value }));
  };

  const handleTFChange = (qid, value) => {
    setTfAnswers((prev) => ({ ...prev, [qid]: value }));
  };

  const getQuestionMark = (answer, correct) => {
    if (!answer) return "0/1";
    return answer === correct ? "1/1" : "0/1";
  };

  // Submit final project.
  const handleSubmit = async () => {
    if (!validateSubmission()) return;
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("authToken");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.post(
        "/final-project",
        {
          code_solution: codeSolution,
          mcq_answers: mcqAnswers,
          tf_answers: tfAnswers,
          playlist_id: playlistId,
          video_id: "8jLOx1hD3_o" // Replace with actual video id if needed
        },
        { headers }
      );
      if (response.data.status === "success") {
        setResult(response.data.data);
        setShowCertificateModal(true); // Automatically show the modal
        if (response.data.data.user_progress_id) {
          setUserProgressId(response.data.data.user_progress_id);
        }
      } else {
        setResult({ error: response.data.message });
      }
    } catch (error) {
      console.error("Error submitting final project:", error);
      setResult({ error: "Submission failed. Please try again." });
    }
    setIsSubmitting(false);
  };

  // Handle rating changes.
  const handleRatingChange = (val) => {
    setUserRating(val);
    setFeedbackSubmitted(false);
  };

  // Submit feedback.
  const handleFeedbackSubmit = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.post(
        "/user-feedback",
        {
          user_progress_id: userProgressId,
          rating: userRating,
          feedback: feedbackNote,
        },
        { headers }
      );
      setFeedbackSubmitted(true);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert("Error submitting feedback. Please try again later.");
    }
  };

  // Return to courses.
  const returnToCourses = () => {
    window.location.href = "/homevideo";
  };

  // Close certificate modal.
  const closeCertificateModal = () => {
    setShowCertificateModal(false);
  };

  return (
    <div className="final-project-container">
      {/* MCQ Section */}
      <div className="final-project-section">
        <h3 className="section-title">Multiple Choice Questions</h3>
        {/* MCQ Q1 */}
        <div className="mcq-question">
          <p>
            Q1: Which STL container is typically implemented as a red-black tree?{" "}
            {result && (
              <span
                className="mark"
                style={{ color: getMarkColor(getQuestionMark(mcqAnswers.q1, result?.correct_mcq?.q1)) }}
              >
                {getQuestionMark(mcqAnswers.q1, result?.correct_mcq?.q1)}
              </span>
            )}
          </p>
          <div className="mcq-options">
            {mcqOptionsQ1.map((opt) => (
              <label key={opt.value} style={{ display: "block", marginBottom: 5 }}>
                <input
                  type="radio"
                  name="mcq_q1"
                  value={opt.value}
                  disabled={!!result}
                  onChange={(e) => handleMCQChange("q1", e.target.value)}
                />{" "}
                {opt.value}) {opt.label}
              </label>
            ))}
          </div>
          {result && (
            <p className="answer-review">
              Your Answer:{" "}
              <span style={getAnswerStyle(mcqAnswers.q1, result?.correct_mcq?.q1)}>
                {mcqAnswers.q1 || "Not answered"}
              </span>{" "}
              | Correct: <span className="correct">{result?.correct_mcq?.q1 || "Not provided"}</span>
            </p>
          )}
        </div>
        {/* MCQ Q2 */}
        <div className="mcq-question">
          <p>
            Q2: Which container provides constant-time random access?{" "}
            {result && (
              <span
                className="mark"
                style={{ color: getMarkColor(getQuestionMark(mcqAnswers.q2, result?.correct_mcq?.q2)) }}
              >
                {getQuestionMark(mcqAnswers.q2, result?.correct_mcq?.q2)}
              </span>
            )}
          </p>
          <div className="mcq-options">
            {mcqOptionsQ2.map((opt) => (
              <label key={opt.value} style={{ display: "block", marginBottom: 5 }}>
                <input
                  type="radio"
                  name="mcq_q2"
                  value={opt.value}
                  disabled={!!result}
                  onChange={(e) => handleMCQChange("q2", e.target.value)}
                />{" "}
                {opt.value}) {opt.label}
              </label>
            ))}
          </div>
          {result && (
            <p className="answer-review">
              Your Answer:{" "}
              <span style={getAnswerStyle(mcqAnswers.q2, result?.correct_mcq?.q2)}>
                {mcqAnswers.q2 || "Not answered"}
              </span>{" "}
              | Correct:{" "}
              <span className="correct">{result?.correct_mcq?.q2 || "Not provided"}</span>
            </p>
          )}
        </div>
      </div>

      {/* True/False Section */}
      <div className="final-project-section">
        <h3 className="section-title">True/False Questions</h3>
        {/* TF Q1 */}
        <div className="tf-question">
          <p>
            Q1: True or False: std::vector is dynamically resizable?{" "}
            {result && (
              <span
                className="mark"
                style={{ color: getMarkColor(getQuestionMark(tfAnswers.q1, result?.correct_tf?.q1)) }}
              >
                {getQuestionMark(tfAnswers.q1, result?.correct_tf?.q1)}
              </span>
            )}
          </p>
          <div className="tf-options" style={{ display: "flex", flexDirection: "column" }}>
            <label style={{ marginBottom: 5 }}>
              <input
                type="radio"
                name="tf_q1"
                value="true"
                disabled={!!result}
                onChange={(e) => handleTFChange("q1", e.target.value)}
              />{" "}
              True
            </label>
            <label style={{ marginBottom: 5 }}>
              <input
                type="radio"
                name="tf_q1"
                value="false"
                disabled={!!result}
                onChange={(e) => handleTFChange("q1", e.target.value)}
              />{" "}
              False
            </label>
          </div>
          {result && (
            <p className="answer-review">
              Your Answer:{" "}
              <span style={getAnswerStyle(tfAnswers.q1, result?.correct_tf?.q1)}>
                {tfAnswers.q1 || "Not answered"}
              </span>{" "}
              | Correct: <span className="correct">{result?.correct_tf?.q1 || "Not provided"}</span>
            </p>
          )}
        </div>
        {/* TF Q2 */}
        <div className="tf-question">
          <p>
            Q2: True or False: std::set allows duplicate elements?{" "}
            {result && (
              <span
                className="mark"
                style={{ color: getMarkColor(getQuestionMark(tfAnswers.q2, result?.correct_tf?.q2)) }}
              >
                {getQuestionMark(tfAnswers.q2, result?.correct_tf?.q2)}
              </span>
            )}
          </p>
          <div className="tf-options" style={{ display: "flex", flexDirection: "column" }}>
            <label style={{ marginBottom: 5 }}>
              <input
                type="radio"
                name="tf_q2"
                value="true"
                disabled={!!result}
                onChange={(e) => handleTFChange("q2", e.target.value)}
              />{" "}
              True
            </label>
            <label style={{ marginBottom: 5 }}>
              <input
                type="radio"
                name="tf_q2"
                value="false"
                disabled={!!result}
                onChange={(e) => handleTFChange("q2", e.target.value)}
              />{" "}
              False
            </label>
          </div>
          {result && (
            <p className="answer-review">
              Your Answer:{" "}
              <span style={getAnswerStyle(tfAnswers.q2, result?.correct_tf?.q2)}>
                {tfAnswers.q2 || "Not answered"}
              </span>{" "}
              | Correct: <span className="correct">{result?.correct_tf?.q2 || "Not provided"}</span>
            </p>
          )}
        </div>
      </div>

      {/* Coding Task Section */}
      <div className="final-project-section">
        <h3 className="section-title">Coding Task</h3>
        <p className="coding-prompt" style={{ whiteSpace: "pre-line" }}>
          {codingPrompt}
        </p>
        <div className="code-task-container dark-mode">
          {result && (
            <div className="toggle-ideal-btn-container">
              <button className="submit-final-button" onClick={toggleIdealCode}>
                {showIdeal ? "Show Your Code" : "Show Ideal Code"}
              </button>
            </div>
          )}
          <div className="editor-wrapper">
            <MonacoEditor
              width="100%"
              height="100%"
              language="cpp"
              theme="custom-dark"
              value={result && showIdeal ? result.correct_code : codeSolution}
              onChange={setCodeSolution}
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
                readOnly: !!(result && showIdeal),
              }}
            />
          </div>
        </div>
      </div>

      {/* Error Message */}
      {errorMsg && <p className="error-message">{errorMsg}</p>}

      {/* Submission Button */}
      {!result && (
        <div className="final-project-section">
          <button
            className="submit-final-button"
            disabled={isSubmitting}
            onClick={handleSubmit}
          >
            {isSubmitting ? "Submitting..." : "Submit Capstone Project"}
          </button>
        </div>
      )}

      {/* Show Result Button if modal is closed */}
      {result && !showCertificateModal && (
        <div className="final-project-section">
          <button
            className="submit-final-button"
            onClick={() => setShowCertificateModal(true)}
          >
            Show Result
          </button>
        </div>
      )}

      {/* Certificate Modal */}
      {result && showCertificateModal && (
        <div className="certificate-modal-overlay">
          <div className="certificate-modal">
            <button className="close-modal-btn" onClick={closeCertificateModal}>
              &times;
            </button>
            <div className="party-left">🎉</div>
            <div className="party-right">🎉</div>
            <h2>
              Congratulations{result.user_name ? `, ${result.user_name}` : ""}!
            </h2>
            <p>You have successfully completed the course!</p>
            <p>
              <strong>Final Score:</strong> {result.final_mark}/10 (
              <span style={{ color: getGradeColor(result.grade) }}>
                Grade: {result.grade}
              </span>
              )
            </p>
            <div className="marks-breakdown">
              <p>Coding Marks: {result.coding_marks}/5</p>
              <p>MCQ Marks: {result.mcq_marks}/3</p>
              <p>TF Marks: {result.tf_marks}/2</p>
            </div>
            <div className="feedback-section">
              <h3>Optional Feedback</h3>
              <StarRating onRatingChange={handleRatingChange} />
              {userRating > 0 && !feedbackSubmitted && (
                <p className="rating-msg">You picked {userRating} out of 5</p>
              )}
              <textarea
                className="feedback-textarea"
                placeholder="Any thoughts about the course?"
                value={feedbackNote}
                onChange={(e) => {
                  setFeedbackNote(e.target.value);
                  setFeedbackSubmitted(false);
                }}
              />
              <div className="feedback-buttons">
                <button className="submit-final-button" onClick={handleFeedbackSubmit}>
                  Submit Feedback
                </button>
                <button className="submit-final-button" onClick={returnToCourses}>
                  Return to Courses
                </button>
              </div>
              {feedbackSubmitted && (
                <p className="thank-you-msg">Thank you for your feedback!</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinalProject;
