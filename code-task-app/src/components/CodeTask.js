import React, { useState } from "react";
import AceEditor from "react-ace";
import axios from "axios";
import "ace-builds/src-noconflict/mode-c_cpp";
import "ace-builds/src-noconflict/theme-monokai";

const API_BASE_URL = "https://judge0-ce.p.rapidapi.com";

const CodeTask = ({ task, onTaskComplete }) => {
    const [code, setCode] = useState("");
    const [feedback, setFeedback] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleTestCode = async () => {
        if (!code.trim()) {
            setFeedback("Please enter code to test.");
            return;
        }

        setIsLoading(true);
        setFeedback("");

        try {
            const response = await axios.post(
                `${API_BASE_URL}/submissions?base64_encoded=false&wait=true`,
                {
                    source_code: code,
                    language_id: 54,
                    stdin: "",
                },
                {
                    headers: {
                        "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
                        "X-RapidAPI-Key": "2a40e6be0dmsh298678b28384f8fp11bcf0jsnb4b072de9050",
                        "Content-Type": "application/json",
                    },
                }
            );

            const output = response.data.stdout?.trim() || response.data.stderr;

            if (output === task.expected_output) {
                setFeedback("Correct! Returning to video...");
                setTimeout(onTaskComplete, 2000);
            } else {
                setFeedback(`Incorrect output. Expected "${task.expected_output}", got "${output}".`);
            }
        } catch (error) {
            setFeedback("Error submitting code.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="task-container">
            <h3>{task.title}</h3>
            <p>{task.prompt}</p>
            <AceEditor
                mode="c_cpp"
                theme="monokai"
                onChange={setCode}
                value={code}
                fontSize={14}
                width="100%"
                height="200px"
            />
            <button onClick={handleTestCode} disabled={isLoading}>
                {isLoading ? "Testing..." : "Submit Code"}
            </button>
            {feedback && <p>{feedback}</p>}
        </div>
    );
};

export default CodeTask;
