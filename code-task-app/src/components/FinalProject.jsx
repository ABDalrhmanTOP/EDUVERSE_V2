import React, { useState } from "react";
import axios from "../api/axios";
import MonacoEditor from "@monaco-editor/react";
import "../styles/FinalProject.css";

const FinalProject = () => {
  const [codeSolution, setCodeSolution] = useState("");
  const [mcqAnswers, setMcqAnswers] = useState({ q1: "", q2: "" });
  const [tfAnswers, setTfAnswers] = useState({ q1: "", q2: "" });
  const [result, setResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Detailed coding assignment instructions:
  const codingPrompt = `Implement a C++ program with the following specifications:
1. Create a class "Person" with private attributes:
   - name (string)
   - age (int)
   Provide a constructor, public getters and setters, and a method named "printInfo()" that prints the person's details.
2. Create a class "Student" that inherits from "Person". 
   - Add a private attribute "courses" which is a std::vector<string>.
   - Implement a method "addCourse(string course)" that adds a course.
   - Implement a method "printCourses()" that prints all enrolled courses.
3. In the main() function:
   - Instantiate a Student with name "John Doe" and age 21.
   - Add at least three courses (for example: "Math", "Computer Science", "Physics").
   - Call "printInfo()" and "printCourses()" to display the details and the list of courses.
Ensure your code uses proper OOP techniques, STL containers, and demonstrates good coding practices.`;

  // Handle MCQ changes
  const handleMCQChange = (qid, value) => {
    setMcqAnswers((prev) => ({ ...prev, [qid]: value }));
  };

  // Handle True/False changes
  const handleTFChange = (qid, value) => {
    setTfAnswers((prev) => ({ ...prev, [qid]: value }));
  };

  // Validate all questions answered
  const validateSubmission = () => {
    if (codeSolution.trim() === "") {
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

  // Handle submission
  const handleSubmit = async () => {
    if (!validateSubmission()) {
      return;
    }
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
        },
        { headers }
      );
      if (response.data.status === "success") {
        setResult(response.data.data);
      } else {
        setResult({ error: response.data.message });
      }
    } catch (error) {
      console.error("Error submitting final project:", error);
      setResult({ error: "Submission failed. Please try again later." });
    }
    setIsSubmitting(false);
  };

  return (
    <div className="final-project-container">
      <h2>Capstone Project</h2>
      <div className="final-project-section">
        <h3>Coding Task</h3>
        <p className="coding-prompt">{codingPrompt}</p>
        <MonacoEditor
          height="300px"
          language="cpp"
          value={codeSolution}
          onChange={setCodeSolution}
          options={{
            fontSize: 15,
            automaticLayout: true,
            theme: "vs-dark" // reusing dark mode design from coding tasks
          }}
        />
      </div>

      <div className="final-project-section">
        <h3>Multiple Choice Questions</h3>
        <div className="mcq-question">
          <p>Q1: Which STL container is typically implemented as a red-black tree?</p>
          <div className="mcq-options">
            <label>
              <input
                type="radio"
                name="mcq_q1"
                value="A"
                onChange={(e) => handleMCQChange("q1", e.target.value)}
              />{" "}
              std::vector
            </label>
            <label>
              <input
                type="radio"
                name="mcq_q1"
                value="B"
                onChange={(e) => handleMCQChange("q1", e.target.value)}
              />{" "}
              std::unordered_map
            </label>
            <label>
              <input
                type="radio"
                name="mcq_q1"
                value="C"
                onChange={(e) => handleMCQChange("q1", e.target.value)}
              />{" "}
              std::set
            </label>
            <label>
              <input
                type="radio"
                name="mcq_q1"
                value="D"
                onChange={(e) => handleMCQChange("q1", e.target.value)}
              />{" "}
              std::list
            </label>
          </div>
        </div>

        <div className="mcq-question">
          <p>Q2: Which container provides constant-time random access?</p>
          <div className="mcq-options">
            <label>
              <input
                type="radio"
                name="mcq_q2"
                value="A"
                onChange={(e) => handleMCQChange("q2", e.target.value)}
              />{" "}
              std::deque
            </label>
            <label>
              <input
                type="radio"
                name="mcq_q2"
                value="B"
                onChange={(e) => handleMCQChange("q2", e.target.value)}
              />{" "}
              std::set
            </label>
            <label>
              <input
                type="radio"
                name="mcq_q2"
                value="C"
                onChange={(e) => handleMCQChange("q2", e.target.value)}
              />{" "}
              std::vector
            </label>
            <label>
              <input
                type="radio"
                name="mcq_q2"
                value="D"
                onChange={(e) => handleMCQChange("q2", e.target.value)}
              />{" "}
              std::map
            </label>
          </div>
        </div>
      </div>

      <div className="final-project-section">
        <h3>True/False Questions</h3>
        <div className="tf-question">
          <p>Q1: True or False: std::vector is dynamically resizable.</p>
          <div className="tf-options">
            <label>
              <input
                type="radio"
                name="tf_q1"
                value="true"
                onChange={(e) => handleTFChange("q1", e.target.value)}
              />{" "}
              True
            </label>
            <label>
              <input
                type="radio"
                name="tf_q1"
                value="false"
                onChange={(e) => handleTFChange("q1", e.target.value)}
              />{" "}
              False
            </label>
          </div>
        </div>

        <div className="tf-question">
          <p>Q2: True or False: std::set allows duplicate elements.</p>
          <div className="tf-options">
            <label>
              <input
                type="radio"
                name="tf_q2"
                value="true"
                onChange={(e) => handleTFChange("q2", e.target.value)}
              />{" "}
              True
            </label>
            <label>
              <input
                type="radio"
                name="tf_q2"
                value="false"
                onChange={(e) => handleTFChange("q2", e.target.value)}
              />{" "}
              False
            </label>
          </div>
        </div>
      </div>

      {errorMsg && <p className="error-message">{errorMsg}</p>}

      <div className="final-project-section">
        <button
          className="submit-final-button"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Submit Final Project"}
        </button>
      </div>

      {result && (
        <div className="final-result">
          {result.error ? (
            <p className="error-message">{result.error}</p>
          ) : (
            <>
              <h2>Your Final Score</h2>
              <p>
                You scored {result.final_mark} out of 10. Your grade is {result.grade}.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default FinalProject;
