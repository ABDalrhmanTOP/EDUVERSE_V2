import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../api/axios";
import "../styles/Form_test.css";

function FormTest() {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [resultsData, setResultsData] = useState(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState("test");

  const { levelId } = useParams();
  const navigate = useNavigate();

  // Define each level's starting timestamp.
  const levelStartTimestamps = {
    "0": "00:00:00",  // Full course start
    "1": "01:13:00",  // Start of Level 2
    "2": "03:00:47",  // Start of Level 3
    "3": "04:46:46",  // Start of Level 4
  };

  // When failing, force user to resume at the start of the same level.
  const failTimestamps = {
    "1": "01:13:00",
    "2": "03:00:47",
    "3": "04:46:46",
  };

  // Highest level before final project.
  const HIGHEST_LEVEL = 3;

  // -----------------------------
  // FETCH TEST QUESTIONS
  // -----------------------------
  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      setError("");
      setViewMode("test");
      setSubmitted(false);
      setResultsData(null);

      try {
        const response = await axios.get(`/showTest/${levelId}`);
        if (response.data.already_taken || response.data.test_token) {
          // Test already taken: redirect to video using saved progress.
          const savedTimestamp = localStorage.getItem("lastWatchedTimestamp") || "00:00:00";
          navigate(`/video?levelId=${levelId}&timestamp=${savedTimestamp}`);
          return;
        }

        if (response.data.questions && response.data.questions.length > 0) {
          setQuestions(response.data.questions);
          const initAnswers = {};
          response.data.questions.forEach((q) => {
            initAnswers[q.id] = null;
          });
          setAnswers(initAnswers);
        } else {
          setError(`No questions found for Level ${levelId}.`);
          setQuestions([]);
        }
      } catch (err) {
        console.error("Error fetching questions:", err);
        setError("Could not load questions. Please try again later or contact support.");
        if (err.response?.status === 401) {
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [levelId, navigate]);

  // -----------------------------
  // SUBMIT TEST ANSWERS
  // -----------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    const unanswered = questions.filter((q) => answers[q.id] === null);
    if (unanswered.length > 0) {
      setError(
        `Please answer question ${
          questions.findIndex((q) => q.id === unanswered[0].id) + 1
        }.`
      );
      return;
    }

    setError("");
    setIsSubmitting(true);
    const formattedAnswers = Object.entries(answers).map(([qId, studentAnswer]) => ({
      question_id: Number(qId),
      student_answer: studentAnswer,
    }));

    try {
      const response = await axios.post(`/submitTest/${levelId}`, {
        answers: formattedAnswers,
      });
      setResultsData(response.data);
      setSubmitted(true);
      setViewMode("results");
    } catch (err) {
      console.error("Error submitting answers:", err);
      setError(err.response?.data?.message || "An error occurred while submitting your answers.");
      setResultsData(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  // -----------------------------
  // SKIP TEST => Navigate to video at this level's start.
  // -----------------------------
  const handleSkip = () => {
    const timestamp = levelStartTimestamps[levelId] || "00:00:00";
    navigate(`/video?levelId=${levelId}&timestamp=${timestamp}`);
  };

  // -----------------------------
  // NEXT STEP => Pass or Fail logic.
  // -----------------------------
  const handleNextStep = async () => {
    if (!resultsData) return;
    const score = resultsData.score || 0;
    const currentLevelNum = parseInt(levelId, 10);

    if (score >= 3) {
      // Passed test: advance to next test or final project.
      if (currentLevelNum === HIGHEST_LEVEL) {
        navigate("/final-project");
      } else {
        navigate(`/form_test/${currentLevelNum + 1}`);
      }
    } else {
      // Failed test: force update progress and resume at the fail timestamp.
      const failTimestamp = failTimestamps[levelId] || levelStartTimestamps[levelId];
      try {
        // Update the user's progress.
        await axios.post("/user-progress", {
          video_id: "yourVideoId", // Replace with a valid video ID
          playlist_id: 1,          // Replace with your actual playlist ID
          last_timestamp: failTimestamp,
        });
        // Optionally mark tasks as completed up to this timestamp.
        await axios.post("/user-progress/completeUpToTimestamp", {
          timestamp: failTimestamp,
          level_id: parseInt(levelId, 10),
        });
      } catch (err) {
        console.error("Error updating progress or marking tasks:", err);
      }
      navigate(`/video?levelId=${levelId}&timestamp=${failTimestamp}`);
    }
  };

  // -----------------------------
  // RENDERING
  // -----------------------------
  if (loading) {
    return (
      <div className="form-loader-container">
        <div className="form-loader"></div>
      </div>
    );
  }

  if (questions.length === 0 && !submitted) {
    return (
      <div className="form-container error-view">
        <h1 className="form-title">Test Unavailable (Level {levelId})</h1>
        <p className="form-error-message">
          {error || "No questions are available for this level."}
        </p>
        <button onClick={() => navigate("/dashboard")} className="form-button secondary">
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (viewMode === "results" && resultsData) {
    const score = resultsData.score || 0;
    const pass = score >= 3;
    return (
      <div className="form-container results-view">
        <h1 className="form-title">Test Results (Level {levelId})</h1>
        {pass ? (
          <div className="results-message pass-message">
            <h2>Congratulations!</h2>
            <p>You scored {score} correct answers and passed Level {levelId}.</p>
            <p>Click below to proceed to the next level test.</p>
          </div>
        ) : (
          <div className="results-message fail-message">
            <h2>Need More Practice</h2>
            <p>
              You scored {score} correct answers, which isn’t enough. We’ll move you to the
              beginning of Level {levelId} for further review.
            </p>
            <p>Click below to resume the course at the appropriate point.</p>
          </div>
        )}
        <button onClick={handleNextStep} className="form-button primary">
          {pass ? "Continue to Next Level" : "Resume Course"}
        </button>
      </div>
    );
  }

  return (
    <div className="form-container">
      <h1 className="form-title">Test (Level {levelId})</h1>
      <p className="helper-text">
        Answer at least 3 questions correctly to move on to the next level.
      </p>
      <button onClick={handleSkip} className="form-button secondary skip-btn">
        Skip Test and Go to Course
      </button>
      <form onSubmit={handleSubmit}>
        {questions.map((q, index) => (
          <div key={q.id} id={`question-${q.id}`} className="question-card">
            <p className="question-text">
              <strong>Question {index + 1}:</strong> {q.question}
            </p>
            <div className="answer-options">
              <button
                type="button"
                className={`answer-button true ${answers[q.id] === "true" ? "selected" : ""}`}
                onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: "true" }))}
              >
                <span className="icon">✓</span> True
              </button>
              <button
                type="button"
                className={`answer-button false ${answers[q.id] === "false" ? "selected" : ""}`}
                onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: "false" }))}
              >
                <span className="icon">✕</span> False
              </button>
            </div>
          </div>
        ))}
        {error && <p className="form-error-message">{error}</p>}
        <button type="submit" className="form-button primary submit-btn" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit Answers"}
        </button>
      </form>
    </div>
  );
}

export default FormTest;
