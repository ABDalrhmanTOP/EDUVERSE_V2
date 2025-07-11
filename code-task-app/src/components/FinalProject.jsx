// src/components/FinalProject.jsx
import React, { useState, useEffect } from "react";
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

const FinalProject = ({ courseId }) => {
  const playlistId = courseId || 1;
  // State for questions
  const [questions, setQuestions] = useState({ mcq: [], tf: [], coding: [] });
  const [loading, setLoading] = useState(true);
  // State for toggling between user's code and ideal code.
  const [showIdeal, setShowIdeal] = useState(false);
  // States for answers.
  const [answers, setAnswers] = useState({}); // { [questionId]: answer }
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

  // 1. Group and order questions by type and difficulty
  const groupAndOrderQuestions = (questions) => {
    const mcq = [...(questions.mcq || [])].sort((a, b) => (a.difficulty || 1) - (b.difficulty || 1));
    const tf = [...(questions.tf || [])].sort((a, b) => (a.difficulty || 1) - (b.difficulty || 1));
    const coding = [...(questions.coding || [])].sort((a, b) => (a.difficulty || 1) - (b.difficulty || 1));
    return { mcq, tf, coding };
  };

  useEffect(() => {
    async function fetchQuestions() {
      setLoading(true);
      try {
        const token = localStorage.getItem("authToken");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await axios.get(`/final-projects/${playlistId}`, { headers });
        if (res.data.status === 'success') {
          setQuestions(groupAndOrderQuestions(res.data.data));
        }
      } catch (err) {
        // handle error
      } finally {
        setLoading(false);
      }
    }
    fetchQuestions();
  }, [playlistId]);

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
    // Validate all questions are answered
    const allQuestions = [
      ...questions.mcq,
      ...questions.tf,
      ...questions.coding
    ];
    for (const q of allQuestions) {
      if (!answers[q.id] || (q.type === 'coding' && !answers[q.id].trim())) {
        setErrorMsg('Please answer all questions.');
        // Scroll to the missing question
        const el = document.getElementById(`question-${q.id}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return false;
      }
    }
    setErrorMsg("");
    return true;
  };

  const handleAnswerChange = (qid, value) => {
    setAnswers((prev) => ({ ...prev, [qid]: value }));
  };

  const getQuestionMark = (answer, correct) => {
    if (!answer) return "0/1";
    return answer === correct ? "1/1" : "0/1";
  };

  // Submit final project.
  const handleSubmit = async () => {
    // Validate all questions are answered
    const missingMcq = questions.mcq.filter(q => !answers[q.id]);
    const missingTf = questions.tf.filter(q => !answers[q.id]);
    const missingCoding = questions.coding.filter(q => !answers[q.id] || !answers[q.id].trim());

    if (missingMcq.length > 0 || missingTf.length > 0 || missingCoding.length > 0) {
      setErrorMsg('Please answer all questions before submitting.');
      // Optionally scroll to the first missing question
      const firstMissing = [...missingMcq, ...missingTf, ...missingCoding][0];
      if (firstMissing) {
        const el = document.getElementById(`question-${firstMissing.id}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setErrorMsg('');
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("authToken");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // Build answer objects
      const mcq_answers = {};
      const tf_answers = {};
      const code_solutions = {};
      questions.mcq.forEach(q => { mcq_answers[q.id] = answers[q.id]; });
      questions.tf.forEach(q => { tf_answers[q.id] = answers[q.id]; });
      questions.coding.forEach(q => { code_solutions[q.id] = answers[q.id]; });

      const payload = {
        mcq_answers,
        tf_answers,
        code_solutions,
        playlist_id: playlistId,
        video_id: "8jLOx1hD3_o" // Replace with actual video id if needed
      };

      const response = await axios.post(
        "/final-project",
        payload,
        { headers }
      );

      if (response.data.status === "success") {
        setResult(response.data.data);
        setShowCertificateModal(true);
        if (response.data.data.user_progress_id) {
          setUserProgressId(response.data.data.user_progress_id);
        }
      } else {
        setResult({ error: response.data.message });
      }
    } catch (error) {
      console.error("Error submitting final project:", error);
      setResult({ error: error?.response?.data?.message || "Submission failed. Please try again." });
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
      {loading ? (
        <p>Loading questions...</p>
      ) : (
        <>
          {/* MCQ Section */}
          {questions.mcq && questions.mcq.length > 0 && (
            <div className="final-project-section">
              <h3 className="section-title">Multiple Choice Questions</h3>
              {questions.mcq.map((q, index) => (
                <div key={q.id} id={`question-${q.id}`} className="mcq-question">
                  <p>
                    Q{index + 1}: {q.text || q.question}
                    {result && (
                      <span
                        className="mark"
                        style={{ color: getMarkColor(getQuestionMark(answers[q.id], result?.correct_mcq?.[q.id])) }}
                      >
                        {getQuestionMark(answers[q.id], result?.correct_mcq?.[q.id])}
                      </span>
                    )}
                  </p>
                  <div className="mcq-options">
                    {q.options.map((opt) => (
                      <label key={opt.value} style={{ display: "block", marginBottom: 5 }}>
                        <input
                          type="radio"
                          name={`mcq_q${index + 1}`}
                          value={opt.value}
                          disabled={!!result}
                          onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                        />{" "}
                        {opt.value}) {opt.label}
                      </label>
                    ))}
                  </div>
                  {result && (
                    <p className="answer-review">
                      Your Answer: {" "}
                      <span style={getAnswerStyle(answers[q.id], result?.correct_mcq?.[q.id])}>
                        {answers[q.id] || "Not answered"}
                      </span>{" "}
                      | Correct: <span className="correct">{result?.correct_mcq?.[q.id] || "Not provided"}</span>
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* True/False Section */}
          {questions.tf && questions.tf.length > 0 && (
            <div className="final-project-section">
              <h3 className="section-title">True/False Questions</h3>
              {questions.tf.map((q, index) => (
                <div key={q.id} id={`question-${q.id}`} className="tf-question">
                  <p>
                    Q{index + 1}: {q.text || q.question}
                    {result && (
                      <span
                        className="mark"
                        style={{ color: getMarkColor(getQuestionMark(answers[q.id], result?.correct_tf?.[q.id])) }}
                      >
                        {getQuestionMark(answers[q.id], result?.correct_tf?.[q.id])}
                      </span>
                    )}
                  </p>
                  <div className="tf-options" style={{ display: "flex", flexDirection: "column" }}>
                    <label style={{ marginBottom: 5 }}>
                      <input
                        type="radio"
                        name={`tf_q${index + 1}`}
                        value="true"
                        disabled={!!result}
                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                      />{" "}
                      True
                    </label>
                    <label style={{ marginBottom: 5 }}>
                      <input
                        type="radio"
                        name={`tf_q${index + 1}`}
                        value="false"
                        disabled={!!result}
                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                      />{" "}
                      False
                    </label>
                  </div>
                  {result && (
                    <p className="answer-review">
                      Your Answer: {" "}
                      <span style={getAnswerStyle(answers[q.id], result?.correct_tf?.[q.id])}>
                        {answers[q.id] || "Not answered"}
                      </span>{" "}
                      | Correct: <span className="correct">{result?.correct_tf?.[q.id] || "Not provided"}</span>
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Coding Task Section */}
          {questions.coding && questions.coding.length > 0 && (
            <div className="final-project-section">
              <h3 className="section-title">Coding Task</h3>
              {questions.coding.map((q, index) => (
                <div key={q.id} id={`question-${q.id}`} className="coding-question">
                  <p>Coding Q{index + 1}: {q.text || q.question}</p>
                  <div className="code-task-container dark-mode">
                    <MonacoEditor
                      width="100%"
                      height="200px"
                      language={q.language || "cpp"}
                      theme="custom-dark"
                      value={answers[q.id] || ""}
                      onChange={(val) => handleAnswerChange(q.id, val)}
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
                  {result && (
                    <div className="answer-review">
                      <span style={getAnswerStyle(answers[q.id], result?.correct_code)}>
                        {answers[q.id] ? "Your code submitted" : "Not answered"}
                      </span>
                      | Correct Solution: <span className="correct">{result?.correct_code || "Not provided"}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

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
                  {result.final_mark >= 0.6 * (result.max_total || 10)
                    ? `Congratulations${result.user_name ? ", " + result.user_name : ""}!`
                    : "You did not pass. Try again!"}
                </h2>
                <p>
                  {result.final_mark >= 0.6 * (result.max_total || 10)
                    ? "You have successfully completed the course!"
                    : "You did not reach the passing mark. Review the correct answers below."}
                </p>
                <p>
                  <strong>Final Score:</strong> {result.final_mark}/{result.max_total} (
                  <span style={{ color: getGradeColor(result.grade) }}>
                    Grade: {result.grade}
                  </span>
                  )
                </p>
                <div className="marks-breakdown">
                  {result.max_mcq > 0 && <p>MCQ Marks: {result.mcq_marks}/{result.max_mcq}</p>}
                  {result.max_tf > 0 && <p>TF Marks: {result.tf_marks}/{result.max_tf}</p>}
                  {result.max_coding > 0 && <p>Coding Marks: {result.coding_marks}/{result.max_coding}</p>}
                </div>
                {/* Show correct answers for each question type */}
                <div className="correct-answers-section">
                  {questions.mcq && questions.mcq.length > 0 && (
                    <div>
                      <h4>MCQ Correct Answers</h4>
                      {questions.mcq.map((q, idx) => (
                        <div key={q.id}>
                          Q{idx + 1}: {q.text || q.question} <br />
                          Correct: <b>{result.correct_mcq?.[q.id]}</b>
                        </div>
                      ))}
                    </div>
                  )}
                  {questions.tf && questions.tf.length > 0 && (
                    <div>
                      <h4>TF Correct Answers</h4>
                      {questions.tf.map((q, idx) => (
                        <div key={q.id}>
                          Q{idx + 1}: {q.text || q.question} <br />
                          Correct: <b>{result.correct_tf?.[q.id]}</b>
                        </div>
                      ))}
                    </div>
                  )}
                  {questions.coding && questions.coding.length > 0 && (
                    <div>
                      <h4>Coding Solution</h4>
                      {questions.coding.map((q, idx) => (
                        <div key={q.id}>
                          Q{idx + 1}: {q.text || q.question} <br />
                          Solution: <pre style={{ background: '#222', color: '#fff', padding: 8 }}>{result.correct_code?.[q.id]}</pre>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {/* Feedback section remains unchanged */}
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
        </>
      )}
    </div>
  );
};

export default FinalProject;
