import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import MonacoEditor from "@monaco-editor/react";
import axios from "../api/axios";
import "../styles/FinalTest.css";
import { 
  FaStar, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaCode, 
  FaListUl,
  FaQuestionCircle,
  FaSpinner,
  FaTrophy,
  FaGraduationCap
} from "react-icons/fa";

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

const FinalTest = ({ onComplete }) => {
  const { t, i18n } = useTranslation();
  const { courseId } = useParams();
  const navigate = useNavigate();
  
  // Test data states
  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // User answers states
  const [mcqAnswers, setMcqAnswers] = useState({});
  const [tfAnswers, setTfAnswers] = useState({});
  const [codeSolutions, setCodeSolutions] = useState({});
  
  // Submission states
  const [result, setResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  
  // Feedback states
  const [userRating, setUserRating] = useState(0);
  const [feedbackNote, setFeedbackNote] = useState("");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  
  // UI states
  const [showIdeal, setShowIdeal] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Load test data
  useEffect(() => {
    const fetchTestData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/final-tests/${courseId}/data`);
        
        if (response.data.status === 'success') {
          setTest(response.data.test);
          setQuestions(response.data.questions || []);
        } else {
          setError('No final test found for this course.');
        }
      } catch (err) {
        setError('Failed to load final test.');
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchTestData();
    }
  }, [courseId]);

  // Initialize answer states when questions load
  useEffect(() => {
    if (questions.length > 0) {
      const initialMcqAnswers = {};
      const initialTfAnswers = {};
      const initialCodeSolutions = {};
      
      questions.forEach(q => {
        if (q.type === 'mcq') {
          initialMcqAnswers[q.id] = '';
        } else if (q.type === 'true_false') {
          initialTfAnswers[q.id] = '';
        } else if (q.type === 'code') {
          initialCodeSolutions[q.id] = q.code_template || '';
        }
      });
      
      setMcqAnswers(initialMcqAnswers);
      setTfAnswers(initialTfAnswers);
      setCodeSolutions(initialCodeSolutions);
    }
  }, [questions]);

  // Handle MCQ answer changes
  const handleMCQChange = (questionId, value) => {
    setMcqAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  // Handle True/False answer changes
  const handleTFChange = (questionId, value) => {
    setTfAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  // Handle code solution changes
  const handleCodeChange = (questionId, value) => {
    setCodeSolutions(prev => ({ ...prev, [questionId]: value }));
  };

  // Validate submission
  const validateSubmission = () => {
    let isValid = true;
    const errors = [];

    questions.forEach(q => {
      if (q.type === 'mcq' && !mcqAnswers[q.id]) {
        errors.push(`Please answer MCQ question: ${q.question.substring(0, 50)}...`);
        isValid = false;
      } else if (q.type === 'true_false' && !tfAnswers[q.id]) {
        errors.push(`Please answer True/False question: ${q.question.substring(0, 50)}...`);
        isValid = false;
      } else if (q.type === 'code' && !codeSolutions[q.id]?.trim()) {
        errors.push(`Please provide code solution for: ${q.question.substring(0, 50)}...`);
        isValid = false;
      }
    });

    if (!isValid) {
      setError(errors.join('\n'));
    } else {
      setError(''); // Clear any previous errors
    }
    return isValid;
  };

  // Submit final test
  const handleSubmit = async () => {
    if (!validateSubmission()) return;
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const token = localStorage.getItem("authToken");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      // Ensure all required arrays are present and properly formatted
      const submissionData = {
        course_id: parseInt(courseId),
        mcq_answers: Object.keys(mcqAnswers).length > 0 ? mcqAnswers : {},
        tf_answers: Object.keys(tfAnswers).length > 0 ? tfAnswers : {},
        code_solutions: Object.keys(codeSolutions).length > 0 ? codeSolutions : {},
      };
      
      console.log('Submitting final test with data:', submissionData);
      console.log('mcqAnswers:', mcqAnswers);
      console.log('tfAnswers:', tfAnswers);
      console.log('codeSolutions:', codeSolutions);
      console.log('courseId:', courseId);
      
      const response = await axios.post(
        "/final-test/submit",
        submissionData,
        { headers }
      );
      
      if (response.data.status === "success") {
        setResult(response.data.data);
        setShowCertificateModal(true);
      } else {
        setError(response.data.message || 'Submission failed.');
      }
    } catch (err) {
      console.error('API Error Response:', err.response?.data);
      if (err.response?.status === 422) {
        setError('Validation error: ' + (err.response.data.message || 'Please check your answers.'));
      } else {
        setError('Submission failed. Please try again.');
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
      navigate("/homevideo");
    }
  };

  // Close certificate modal
  const closeCertificateModal = () => {
    setShowCertificateModal(false);
  };

  // Get question type icon
  const getQuestionTypeIcon = (type) => {
    switch (type) {
      case 'mcq':
        return <FaListUl size={20} />;
      case 'true_false':
        return <FaCheckCircle size={20} />;
      case 'code':
        return <FaCode size={20} />;
      default:
        return <FaQuestionCircle size={20} />;
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="final-test-loading">
        <FaSpinner className="spinner" />
        <p>{i18n.language === 'ar' ? 'جاري تحميل الاختبار النهائي...' : 'Loading final test...'}</p>
      </div>
    );
  }

  // Error state
  if (error && !test) {
    return (
      <div className="final-test-error">
        <FaTimesCircle />
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="final-test-container">
      {/* Test Header */}
      <motion.div 
        className="final-test-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="test-title">
          <FaGraduationCap size={32} />
          <h1>{test?.title || (i18n.language === 'ar' ? 'الاختبار النهائي' : 'Final Test')}</h1>
        </div>
        <p className="test-description">
          {test?.description || (i18n.language === 'ar' 
            ? 'أكمل هذا الاختبار لإتمام الدورة بنجاح' 
            : 'Complete this test to successfully finish the course')}
        </p>
      </motion.div>

      {/* Questions */}
      <AnimatePresence mode="wait">
        {questions.map((question, index) => (
          <motion.div
            key={question.id}
            className="final-test-section"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <div className="question-header">
              <span className="question-type-badge">
                {getQuestionTypeIcon(question.type)}
              </span>
              <h3 className="section-title">
                {i18n.language === 'ar' ? `السؤال ${index + 1}` : `Question ${index + 1}`}
              </h3>
            </div>

            {/* MCQ Question */}
            {question.type === 'mcq' && (
              <div className="mcq-question">
                <p className="question-text">{question.question}</p>
                <div className="mcq-options">
                  {Array.isArray(question.options) ? question.options.map((option, optIndex) => (
                    <label key={optIndex} className="mcq-option">
                      <input
                        type="radio"
                        name={`mcq_${question.id}`}
                        value={option}
                        checked={mcqAnswers[question.id] === option}
                        onChange={(e) => handleMCQChange(question.id, e.target.value)}
                        disabled={!!result}
                      />
                      <span className="option-text">{option}</span>
                    </label>
                  )) : (
                    <p className="error-message">No options available for this question.</p>
                  )}
                </div>
                {result && (
                  <div className="answer-review">
                    <p>
                      {i18n.language === 'ar' ? 'إجابتك:' : 'Your Answer:'}{" "}
                      <span style={getAnswerStyle(mcqAnswers[question.id], result?.correct_answers?.mcq?.[question.id])}>
                        {mcqAnswers[question.id] || (i18n.language === 'ar' ? 'لم تجب' : 'Not answered')}
                      </span>
                    </p>
                    <p>
                      {i18n.language === 'ar' ? 'الإجابة الصحيحة:' : 'Correct Answer:'}{" "}
                      <span className="correct-answer">
                        {result?.correct_answers?.mcq?.[question.id] || (i18n.language === 'ar' ? 'غير متوفر' : 'Not provided')}
                      </span>
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* True/False Question */}
            {question.type === 'true_false' && (
              <div className="tf-question">
                <p className="question-text">{question.question}</p>
                <div className="tf-options">
                  <label className="tf-option">
                    <input
                      type="radio"
                      name={`tf_${question.id}`}
                      value="true"
                      checked={tfAnswers[question.id] === 'true'}
                      onChange={(e) => handleTFChange(question.id, e.target.value)}
                      disabled={!!result}
                    />
                    <span className="option-text">{i18n.language === 'ar' ? 'صح' : 'True'}</span>
                  </label>
                  <label className="tf-option">
                    <input
                      type="radio"
                      name={`tf_${question.id}`}
                      value="false"
                      checked={tfAnswers[question.id] === 'false'}
                      onChange={(e) => handleTFChange(question.id, e.target.value)}
                      disabled={!!result}
                    />
                    <span className="option-text">{i18n.language === 'ar' ? 'خطأ' : 'False'}</span>
                  </label>
                </div>
                {result && (
                  <div className="answer-review">
                    <p>
                      {i18n.language === 'ar' ? 'إجابتك:' : 'Your Answer:'}{" "}
                      <span style={getAnswerStyle(tfAnswers[question.id], result?.correct_answers?.tf?.[question.id])}>
                        {tfAnswers[question.id] || (i18n.language === 'ar' ? 'لم تجب' : 'Not answered')}
                      </span>
                    </p>
                    <p>
                      {i18n.language === 'ar' ? 'الإجابة الصحيحة:' : 'Correct Answer:'}{" "}
                      <span className="correct-answer">
                        {result?.correct_answers?.tf?.[question.id] || (i18n.language === 'ar' ? 'غير متوفر' : 'Not provided')}
                      </span>
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Coding Question */}
            {question.type === 'code' && (
              <div className="code-question">
                <p className="question-text">{question.question}</p>
                <div className="code-task-container">
                  {result && (
                    <div className="toggle-ideal-btn-container">
                      <button 
                        className="toggle-ideal-btn" 
                        onClick={() => setShowIdeal(!showIdeal)}
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
                      value={result && showIdeal ? result?.ideal_code?.[question.id] : codeSolutions[question.id]}
                      onChange={(value) => handleCodeChange(question.id, value)}
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
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Error Message */}
      {error && <p className="error-message">{error}</p>}

      {/* Submission Button */}
      {!result && (
        <motion.div 
          className="final-test-section"
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
                {i18n.language === 'ar' ? 'إرسال الاختبار النهائي' : 'Submit Final Test'}
              </>
            )}
          </button>
        </motion.div>
      )}

      {/* Show Result Button if modal is closed */}
      {result && !showCertificateModal && (
        <div className="final-test-section">
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

export default FinalTest; 