import React, { useState } from "react";
import AceEditor from "react-ace";
import axios from "axios";
import "ace-builds/src-noconflict/mode-c_cpp";
import "ace-builds/src-noconflict/theme-monokai";
import "../styles/CodeTask.css";

axios.defaults.baseURL = "http://127.0.0.1:8000/api";

const CodeTask = ({ task, onTaskComplete }) => {
    const [code, setCode] = useState("");
    const [feedback, setFeedback] = useState({ type: "", message: "" });
    const [isLoading, setIsLoading] = useState(false);

    const handleTestCode = async () => {
        if (!code.trim()) {
            setFeedback({ type: "error", message: "⚠️ Please enter your code before submitting." });
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
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const { success, error, details } = response.data;

            if (success) {
                setFeedback({ type: "success", message: "✅ Correct! Well done!" });
                setTimeout(() => onTaskComplete(), 2000);
            } else {
                setFeedback({
                    type: "error",
                    message: `❌ ${error}. Details: ${details}`,
                });
            }
        } catch (error) {
            const errorMessage = error.response?.data?.error || "Unknown error occurred";
            const errorDetails = error.response?.data?.details || "";
            setFeedback({
                type: "error",
                message: ` Error submitting code: ${errorMessage}. ${errorDetails}`,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="code-task-container">
            <h3>{task.title}</h3>
            <p>{task.prompt}</p>
            <AceEditor
                mode="c_cpp"
                theme="monokai"
                onChange={(newValue) => setCode(newValue)}
                value={code}
                fontSize={14}
                width="100%"
                height="200px"
                className="ace-editor"
            />
            <button className="submit-button" onClick={handleTestCode} disabled={isLoading}>
                {isLoading ? "Testing..." : "Submit Code"}
            </button>

            {/* Feedback Modal */}
            {feedback.message && (
                <div className={`modal-container ${isLoading ? "loading" : ""}`}>
                    {isLoading ? (
                        <div className="modal-spinner">
                            <div className="spinner"></div>
                        </div>
                    ) : (
                        <div className={`modal-feedback feedback-${feedback.type}`}>
                            <div className="icon">
                                {feedback.type === "success" ? (
                                    <div className="success-icon">✔️</div>
                                ) : (
                                    <div className="error-icon">❌</div>
                                )}
                            </div>
                            <p className="feedback-message">{feedback.message}</p>
                            <button
                                className="close-button"
                                onClick={() => setFeedback({})}
                            >
                                Close
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CodeTask;
