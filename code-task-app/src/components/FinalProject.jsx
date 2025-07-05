// src/components/FinalProject.jsx
import React, { useState } from "react";
import axios from "../api/axios";
import MonacoEditor from "@monaco-editor/react";
import "../styles/FinalProject.css";
import { FaStar, FaCode, FaCheckCircle, FaListUl, FaTrophy, FaSpinner, FaTimesCircle, FaGraduationCap } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";

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

const FinalProject = ({ courseId, onComplete }) => {
  const { t, i18n } = useTranslation();
  
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

  // Submit final project - FIXED API STRUCTURE
  const handleSubmit = async () => {
    if (!validateSubmission()) return;
    setIsSubmitting(true);
    setErrorMsg("");
    
    try {
      const token = localStorage.getItem("authToken");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      // CORRECT API STRUCTURE FOR FINAL PROJECT
      const submissionData = {
        code_solution: codeSolution,
        mcq_answers: mcqAnswers,
        tf_answers: tfAnswers,
        playlist_id: courseId || 1,
        video_id: "8jLOx1hD3_o" // Replace with actual video id if needed
      };
      
      console.log('Submitting final project with data:', submissionData);
      
      const response = await axios.post(
        "/final-project",
        submissionData,
        { headers }
      );
      
      if (response.data.status === "success") {
        setResult(response.data.data);
        setShowCertificateModal(true);
        if (response.data.data.user_progress_id) {
          setUserProgressId(response.data.data.user_progress_id);
        }
      } else {
        setErrorMsg(response.data.message || "Submission failed.");
      }
    } catch (err) {
      console.error('API Error Response:', err.response?.data);
      if (err.response?.status === 422) {
        setErrorMsg('Validation error: ' + (err.response.data.message || 'Please check your answers.'));
      } else {
        setErrorMsg("Submission failed. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle rating changes
  const handleRatingChange = (val) => {
    setUserRating(val);
    setFeedbackSubmitted(false);
  };

  // Submit feedback
  const handleFeedbackSubmit = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      await axios.post(
        "/user-feedback",
        {
          user_progress_id: result?.user_progress_id,
          rating: userRating,
          feedback: feedbackNote,
        },
        { headers }
      );
      
      setFeedbackSubmitted(true);
    } catch (error) {
      console.error('Feedback submission error:', error.response?.data);
      alert("Error submitting feedback. Please try again later.");
    }
  };

  // Return to courses
  const returnToCourses = () => {
    if (onComplete) {
      onComplete();
    } else {
      window.location.href = "/homevideo";
    }
  };

  // Close certificate modal
  const closeCertificateModal = () => {
    setShowCertificateModal(false);
  };

  return (
    <div className="final-project-container">
      {/* Project Header */}
      <motion.div 
        className="final-project-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="project-title">
          <FaGraduationCap size={32} />
          <h1>{i18n.language === 'ar' ? 'المشروع النهائي' : 'Final Project'}</h1>
        </div>
        <p className="project-description">
          {i18n.language === 'ar' 
            ? 'أكمل هذا المشروع لإتمام الدورة بنجاح' 
            : 'Complete this project to successfully finish the course'}
        </p>
      </motion.div>

      {/* MCQ Questions */}
      <AnimatePresence mode="wait">
        <motion.div
          className="final-project-section"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.5 }}
        >
          <div className="question-header">
            <span className="question-type-badge">
              <FaListUl size={20} />
            </span>
            <h3 className="section-title">
              {i18n.language === 'ar' ? 'أسئلة الاختيار المتعدد' : 'Multiple Choice Questions'}
            </h3>
          </div>

          {/* MCQ Question 1 */}
          <div className="mcq-question">
            <p className="question-text">
              {i18n.language === 'ar' 
                ? 'أي من هياكل البيانات التالية يوفر البحث الأسرع؟' 
                : 'Which of the following data structures provides the fastest search?'}
            </p>
            <div className="mcq-options">
              {mcqOptionsQ1.map((option) => (
                <label key={option.value} className="mcq-option">
                  <input
                    type="radio"
                    name="mcq_q1"
                    value={option.value}
                    checked={mcqAnswers.q1 === option.value}
                    onChange={(e) => handleMCQChange("q1", e.target.value)}
                    disabled={!!result}
                  />
                  <span className="option-text">{option.label}</span>
                </label>
              ))}
            </div>
            {result && (
              <div className="answer-review">
                <p>
                  {i18n.language === 'ar' ? 'إجابتك:' : 'Your Answer:'}{" "}
                  <span style={getAnswerStyle(mcqAnswers.q1, "C")}>
                    {mcqAnswers.q1 || (i18n.language === 'ar' ? 'لم تجب' : 'Not answered')}
                  </span>
                </p>
                <p>
                  {i18n.language === 'ar' ? 'الإجابة الصحيحة:' : 'Correct Answer:'}{" "}
                  <span className="correct-answer">C (std::map)</span>
                </p>
              </div>
            )}
          </div>

          {/* MCQ Question 2 */}
          <div className="mcq-question">
            <p className="question-text">
              {i18n.language === 'ar' 
                ? 'أي من الحاويات التالية يوفر إدراج وحذف سريع من البداية والنهاية؟' 
                : 'Which of the following containers provides fast insertion and deletion from both ends?'}
            </p>
            <div className="mcq-options">
              {mcqOptionsQ2.map((option) => (
                <label key={option.value} className="mcq-option">
                  <input
                    type="radio"
                    name="mcq_q2"
                    value={option.value}
                    checked={mcqAnswers.q2 === option.value}
                    onChange={(e) => handleMCQChange("q2", e.target.value)}
                    disabled={!!result}
                  />
                  <span className="option-text">{option.label}</span>
                </label>
              ))}
            </div>
            {result && (
              <div className="answer-review">
                <p>
                  {i18n.language === 'ar' ? 'إجابتك:' : 'Your Answer:'}{" "}
                  <span style={getAnswerStyle(mcqAnswers.q2, "B")}>
                    {mcqAnswers.q2 || (i18n.language === 'ar' ? 'لم تجب' : 'Not answered')}
                  </span>
                </p>
                <p>
                  {i18n.language === 'ar' ? 'الإجابة الصحيحة:' : 'Correct Answer:'}{" "}
                  <span className="correct-answer">B (std::deque)</span>
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* True/False Questions */}
        <motion.div
          className="final-project-section"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="question-header">
            <span className="question-type-badge">
              <FaCheckCircle size={20} />
            </span>
            <h3 className="section-title">
              {i18n.language === 'ar' ? 'أسئلة صح/خطأ' : 'True/False Questions'}
            </h3>
          </div>

          {/* TF Question 1 */}
          <div className="tf-question">
            <p className="question-text">
              {i18n.language === 'ar' 
                ? 'std::vector يوفر إدراج وحذف سريع من المنتصف.' 
                : 'std::vector provides fast insertion and deletion from the middle.'}
            </p>
            <div className="tf-options">
              <label className="tf-option">
                <input
                  type="radio"
                  name="tf_q1"
                  value="true"
                  checked={tfAnswers.q1 === "true"}
                  onChange={(e) => handleTFChange("q1", e.target.value)}
                  disabled={!!result}
                />
                <span className="option-text">{i18n.language === 'ar' ? 'صح' : 'True'}</span>
              </label>
              <label className="tf-option">
                <input
                  type="radio"
                  name="tf_q1"
                  value="false"
                  checked={tfAnswers.q1 === "false"}
                  onChange={(e) => handleTFChange("q1", e.target.value)}
                  disabled={!!result}
                />
                <span className="option-text">{i18n.language === 'ar' ? 'خطأ' : 'False'}</span>
              </label>
            </div>
            {result && (
              <div className="answer-review">
                <p>
                  {i18n.language === 'ar' ? 'إجابتك:' : 'Your Answer:'}{" "}
                  <span style={getAnswerStyle(tfAnswers.q1, "false")}>
                    {tfAnswers.q1 || (i18n.language === 'ar' ? 'لم تجب' : 'Not answered')}
                  </span>
                </p>
                <p>
                  {i18n.language === 'ar' ? 'الإجابة الصحيحة:' : 'Correct Answer:'}{" "}
                  <span className="correct-answer">False</span>
                </p>
              </div>
            )}
          </div>

          {/* TF Question 2 */}
          <div className="tf-question">
            <p className="question-text">
              {i18n.language === 'ar' 
                ? 'std::map يحافظ على ترتيب العناصر حسب المفاتيح.' 
                : 'std::map maintains the order of elements by keys.'}
            </p>
            <div className="tf-options">
              <label className="tf-option">
                <input
                  type="radio"
                  name="tf_q2"
                  value="true"
                  checked={tfAnswers.q2 === "true"}
                  onChange={(e) => handleTFChange("q2", e.target.value)}
                  disabled={!!result}
                />
                <span className="option-text">{i18n.language === 'ar' ? 'صح' : 'True'}</span>
              </label>
              <label className="tf-option">
                <input
                  type="radio"
                  name="tf_q2"
                  value="false"
                  checked={tfAnswers.q2 === "false"}
                  onChange={(e) => handleTFChange("q2", e.target.value)}
                  disabled={!!result}
                />
                <span className="option-text">{i18n.language === 'ar' ? 'خطأ' : 'False'}</span>
              </label>
            </div>
            {result && (
              <div className="answer-review">
                <p>
                  {i18n.language === 'ar' ? 'إجابتك:' : 'Your Answer:'}{" "}
                  <span style={getAnswerStyle(tfAnswers.q2, "true")}>
                    {tfAnswers.q2 || (i18n.language === 'ar' ? 'لم تجب' : 'Not answered')}
                  </span>
                </p>
                <p>
                  {i18n.language === 'ar' ? 'الإجابة الصحيحة:' : 'Correct Answer:'}{" "}
                  <span className="correct-answer">True</span>
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Coding Question */}
        <motion.div
          className="final-project-section"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="question-header">
            <span className="question-type-badge">
              <FaCode size={20} />
            </span>
            <h3 className="section-title">
              {i18n.language === 'ar' ? 'سؤال البرمجة' : 'Coding Question'}
            </h3>
          </div>

          <div className="code-question">
            <p className="question-text">{codingPrompt}</p>
            <div className="code-task-container">
              {result && (
                <div className="toggle-ideal-btn-container">
                  <button 
                    className="toggle-ideal-btn" 
                    onClick={toggleIdealCode}
                  >
                    {showIdeal 
                      ? (i18n.language === 'ar' ? 'عرض كودك' : 'Show Your Code') 
                      : (i18n.language === 'ar' ? 'عرض الكود المثالي' : 'Show Ideal Code')
                    }
                  </button>
                </div>
              )}
              <div className="editor-wrapper">
                <MonacoEditor
                  width="100%"
                  height="400px"
                  language="cpp"
                  theme="vs-dark"
                  value={result && showIdeal ? result?.ideal_code || "// Ideal solution not provided" : codeSolution}
                  onChange={(value) => setCodeSolution(value)}
                  onMount={handleEditorMount}
                  options={{
                    fontSize: 14,
                    lineHeight: 20,
                    fontFamily: "Fira Code, monospace",
                    readOnly: !!(result && showIdeal),
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                  }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Error Message */}
      {errorMsg && <p className="error-message">{errorMsg}</p>}

      {/* Submission Button */}
      {!result && (
        <motion.div 
          className="final-project-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <button
            className="submit-final-button"
            disabled={isSubmitting}
            onClick={handleSubmit}
          >
            {isSubmitting ? (
              <>
                <FaSpinner className="spinner" />
                {i18n.language === 'ar' ? 'جاري الإرسال...' : 'Submitting...'}
              </>
            ) : (
              <>
                <FaTrophy />
                {i18n.language === 'ar' ? 'إرسال المشروع النهائي' : 'Submit Final Project'}
              </>
            )}
          </button>
        </motion.div>
      )}

      {/* Show Result Button if modal is closed */}
      {result && !showCertificateModal && (
        <div className="final-project-section">
          <button
            className="submit-final-button"
            onClick={() => setShowCertificateModal(true)}
          >
            {i18n.language === 'ar' ? 'عرض النتيجة' : 'Show Result'}
          </button>
        </div>
      )}

      {/* Certificate Modal */}
      {result && showCertificateModal && (
        <div className="certificate-modal-overlay">
          <motion.div 
            className="certificate-modal"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <button className="close-modal-btn" onClick={closeCertificateModal}>
              &times;
            </button>
            <div className="party-left">🎉</div>
            <div className="party-right">🎉</div>
            <h2>
              {i18n.language === 'ar' ? 'تهانينا!' : 'Congratulations!'}
            </h2>
            <p>{i18n.language === 'ar' ? 'لقد أكملت الدورة بنجاح!' : 'You have successfully completed the course!'}</p>
            <p>
              <strong>{i18n.language === 'ar' ? 'النتيجة النهائية:' : 'Final Score:'}</strong> {result.final_mark}/10 (
              <span style={{ color: getGradeColor(result.grade) }}>
                {i18n.language === 'ar' ? `الدرجة: ${result.grade}` : `Grade: ${result.grade}`}
              </span>
              )
            </p>
            <div className="marks-breakdown">
              <p>{i18n.language === 'ar' ? 'علامات البرمجة:' : 'Coding Marks:'} {result.coding_marks}/{result.total_questions?.coding || 5}</p>
              <p>{i18n.language === 'ar' ? 'علامات الاختيار المتعدد:' : 'MCQ Marks:'} {result.mcq_marks}/{result.total_questions?.mcq || 3}</p>
              <p>{i18n.language === 'ar' ? 'علامات صح/خطأ:' : 'TF Marks:'} {result.tf_marks}/{result.total_questions?.tf || 2}</p>
            </div>
            <div className="feedback-section">
              <h3>{i18n.language === 'ar' ? 'ملاحظات اختيارية' : 'Optional Feedback'}</h3>
              <StarRating onRatingChange={handleRatingChange} />
              {userRating > 0 && !feedbackSubmitted && (
                <p className="rating-msg">
                  {i18n.language === 'ar' 
                    ? `لقد اخترت ${userRating} من 5` 
                    : `You picked ${userRating} out of 5`
                  }
                </p>
              )}
              <textarea
                className="feedback-textarea"
                placeholder={i18n.language === 'ar' ? 'أي أفكار حول الدورة؟' : 'Any thoughts about the course?'}
                value={feedbackNote}
                onChange={(e) => {
                  setFeedbackNote(e.target.value);
                  setFeedbackSubmitted(false);
                }}
              />
              <div className="feedback-buttons">
                <button className="submit-final-button" onClick={handleFeedbackSubmit}>
                  {i18n.language === 'ar' ? 'إرسال الملاحظات' : 'Submit Feedback'}
                </button>
                <button className="submit-final-button" onClick={returnToCourses}>
                  {i18n.language === 'ar' ? 'العودة إلى الدورات' : 'Return to Courses'}
                </button>
              </div>
              {feedbackSubmitted && (
                <p className="thank-you-msg">
                  {i18n.language === 'ar' ? 'شكراً لك على ملاحظاتك!' : 'Thank you for your feedback!'}
                </p>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default FinalProject;
