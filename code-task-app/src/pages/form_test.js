import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../api/axios";
import "bootstrap/dist/css/bootstrap.min.css";

function FormTest() {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState("");
  const [data, setData] = useState(null);

  // We only have one param here: levelId
  const { levelId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`/showTest/${levelId}`);

        // If user already took the test => test_token
        if (response.data.test_token) {
          setSubmitted(true);
          // Navigate to /video (lowercase) so it matches your route
          navigate("/video");
          return;
        }

        // Otherwise, show the questions
        setQuestions(response.data.questions || []);
      } catch (error) {
        console.error("Error fetching questions:", error);
        setMessage("Could not load questions.");
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [levelId, navigate]);

  const handleAnswer = (questionId, answer) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = async () => {
    if (questions.some((q) => answers[q.id] === undefined)) {
      alert("Please answer all questions before submitting.");
      return;
    }
    const formattedAnswers = Object.entries(answers).map(
      ([qId, studentAnswer]) => ({
        question_id: Number(qId),
        student_answer: studentAnswer,
      })
    );

    try {
      const response = await axios.post(`/submitTest/${levelId}`, {
        answers: formattedAnswers,
      });
      setData(response.data);
      setSubmitted(true);

      // If they'd like to auto-navigate once submitted, do so:
      // If the backend sets user->test_taken = true, you can also do:
      // navigate("/video");
    } catch (error) {
      setMessage("Error sending answers");
      console.error(error?.response?.data || error.message);
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">True or False Test (Level {levelId})</h1>

      {loading ? (
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : questions.length > 0 ? (
        <div className="test-container">
          {questions.map((q, index) => (
            <div key={q.id} className="card p-3 mb-3 shadow-sm">
              <p className="mb-2">
                <strong>Question {index + 1}:</strong> {q.question}
              </p>
              <div className="d-flex gap-2">
                <button
                  onClick={() => handleAnswer(q.id, "true")}
                  className={`btn ${
                    answers[q.id] === "true"
                      ? "btn-success"
                      : "btn-outline-success"
                  }`}
                >
                  True
                </button>
                <button
                  onClick={() => handleAnswer(q.id, "false")}
                  className={`btn ${
                    answers[q.id] === "false"
                      ? "btn-danger"
                      : "btn-outline-danger"
                  }`}
                >
                  False
                </button>
              </div>
            </div>
          ))}
          <button
            onClick={handleSubmit}
            className="btn btn-primary w-100 mt-3"
            data-bs-toggle="modal"
            data-bs-target="#resultModal"
          >
            Submit
          </button>
        </div>
      ) : (
        <p>No questions found.</p>
      )}

      {/* Optional Results Modal */}
      <div
        className="modal fade"
        id="resultModal"
        tabIndex="-1"
        aria-labelledby="resultModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="resultModalLabel">
                Test Results
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              {submitted && data ? (
                <ul className="list-group">
                  <li className="list-group-item">
                    <strong>Score:</strong> {data?.score ?? "N/A"}
                  </li>
                  <li className="list-group-item">
                    <strong>Correct Answers:</strong>{" "}
                    {data?.correct_answers?.join(", ") ?? "N/A"}
                  </li>
                  <li className="list-group-item">
                    <strong>Next Level:</strong>{" "}
                    {data?.next_level?.id
                      ? `Level ${data.next_level.id}`
                      : "No next level"}
                  </li>
                </ul>
              ) : (
                <p>Test Submitted!</p>
              )}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {message && <div className="alert alert-info mt-3">{message}</div>}
    </div>
  );
}

export default FormTest;
