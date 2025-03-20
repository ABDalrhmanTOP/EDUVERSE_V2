import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import "bootstrap/dist/css/bootstrap.min.css";

function FormTest() {
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(true);
    const [submitted, setSubmitted] = useState(false);
    const [inputLevel, setInputLevel] = useState(1);
    const [message, setMessage] = useState("");
    const [data, setData] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchQuestions = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`/showTest/${inputLevel}`);
                localStorage.setItem("test_token", response.data.test_token);

                if (response.data.test_token) {
                    // If test_token is present, it means the user already took this test.
                    setSubmitted(true);
                    navigate("/Video");
                } else if (inputLevel <= 3) {
                    setQuestions(response.data.questions || []);
                } else {
                    alert("Go to project");
                    setSubmitted(true);
                    navigate("/");
                }
            } catch (error) {
                console.error("Error fetching questions:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchQuestions();
    }, [inputLevel, navigate]);

    const handleAnswer = (questionId, answer) => {
        setAnswers((prevAnswers) => ({ ...prevAnswers, [questionId]: answer }));
    };

    const handleSubmit = async () => {
        // Ensure all questions have answers
        if (questions.some((q) => answers[q.id] === undefined)) {
            alert("Please answer all questions before submitting.");
            return;
        }

        const formattedAnswers = Object.entries(answers).map(([questionId, studentAnswer]) => ({
            question_id: parseInt(questionId),
            student_answer: studentAnswer,
        }));

        try {
            const response = await axios.post(`/submitTest/${inputLevel}`, { answers: formattedAnswers });
            setAnswers({});
            if (response.data.next_level?.id) {
                setInputLevel(response.data.next_level.id);
                setMessage("Level up!");
            }
            setData(response.data); 
            setSubmitted(true);
        } catch (error) {
            setMessage("Error sending answers");
            console.error(error?.response?.data || error.message);
        }
    };

    return (
        <div className="container mt-5">
            <h1 className="text-center mb-4">True or False Test</h1>

            {loading ? (
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            ) : (
                <div className="test-container">
                    {questions.map((question, index) => (
                        <div key={question.id} className="card p-3 mb-3 shadow-sm">
                            <p className="mb-2">
                                <strong>Question {index + 1}:</strong> {question.question}
                            </p>
                            <div className="d-flex gap-2">
                                <button
                                    onClick={() => handleAnswer(question.id, "true")}
                                    className={`btn ${
                                        answers[question.id] === "true" ? "btn-success" : "btn-outline-success"
                                    }`}
                                >
                                    True
                                </button>
                                <button
                                    onClick={() => handleAnswer(question.id, "false")}
                                    className={`btn ${
                                        answers[question.id] === "false" ? "btn-danger" : "btn-outline-danger"
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
            )}

            {/* Modal for test results */}
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
                                        <strong>Test Name:</strong>{" "}
                                        {data?.test?.name ?? "N/A"}
                                    </li>
                                    <li className="list-group-item">
                                        <strong>Score:</strong>{" "}
                                        {data?.score ?? "N/A"}
                                    </li>
                                    <li className="list-group-item">
                                        <strong>Correct Answers:</strong>{" "}
                                        {data?.correct_answers ?? "N/A"}
                                    </li>
                                    <li className="list-group-item">
                                        <strong>Next Level:</strong>{" "}
                                        {data?.next_level?.level_name ?? "N/A"}
                                    </li>
                                </ul>
                            ) : (
                                <p>Test Submitted! 🎉</p>
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
