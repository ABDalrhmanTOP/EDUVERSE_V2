import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";

function Form_Test() {
    const [questions, setQuestions] = useState([]); // 
    const [answers, setAnswers] = useState([]); //
    const [loading, setLoading] = useState(true); // 
    const [submitted, setSubmitted] = useState(false); //
    const [inputlevel, setInputLevel] = useState(1); //
    const [message, setMessage] = useState("");
    const [data , setData]=useState(null);
    const navigate = useNavigate();
    // جلب الأسئلة من API عند تحميل الصفحة
    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const response = await axios.get(`/showTest/${inputlevel}`);
                console.log (inputlevel);
                localStorage.setItem("test_token", response.data.test_token);
                if (!response.data.test_token) {
                    if (inputlevel <= 3) {
                        setQuestions(response.data.questions);
                        console.log(questions);
                        setLoading(false); // إذا كانت الأسئلة موجودة، قم بتعيينها
                    } else {
                        console.log("enter else")
                        setQuestions([]); // تعيين قائمة فارغة إذا لم تكن هناك أسئلة
                        alert("go to project");
                        setSubmitted(true);
                        navigate("")
                        setLoading(false);
                    }
                } else {
                    setQuestions([]); // تعيين قائمة فارغة إذا لم تكن هناك أسئلة
                    setSubmitted(true);
                    setLoading(false);
                    navigate("");
                    navigate("/Video");

                }
            } catch (error) {
                console.error("Error fetching questions:", error);
                setLoading(false);
            }
        }
        fetchQuestions();
    }, [inputlevel]);

    // تحديث الإجابة عند اختيار المستخدم
    const handleAnswer = async (questionId, answer) => {
        const updatedAnswers = ({ ...answers, [questionId]: answer });
        setAnswers(updatedAnswers);
        console.log(answers);
    };
    // إرسال الإجابات إلى API
    const handleSubmit = async () => {
        const allAnswered = questions.every((q) => answers[q.id] !== undefined);
        if (!allAnswered) {
            alert("Please answer all questions before submitting.");
            return;
        }
        const formattedAnswers = Object.entries(answers).map(([questionId, studentAnswer]) => ({
            question_id: parseInt(questionId),
            student_answer: studentAnswer,
        }));

        try {
            const response = await axios.post(`/submitTest/${inputlevel}`, { answers: formattedAnswers });
            console.log(response.data)
            console.log(response.data.next_level.id)
            setAnswers({});
            if (response.data.next_level.id >= 1) {
                setInputLevel(response.data.next_level.id); // تحديث المستوى إلى المستوى الجديد
                setMessage("Level up")
            }
        } catch (error) {
            setMessage("Error sending answers");
            console.error(error?.response?.data || error.message);
        }


    };


    return (
        <div style={{ padding: "20px", fontFamily: "Arial, sans-serif"}}>
            <h1>test true or false</h1>

            {loading ? (
                <p>loading..</p>
            ) : submitted ? (
                    <div>
                        <h1>نتائج الاختبار</h1>
                        {data && (
                            <ul>
                                <li>اسم الاختبار: {data.test}</li>
                                <li>الدرجة: {data.score}</li>
                                <li>الإجابات الصحيحة: {data.correct_answers}</li>
                                <li>المستوى التالي: {data.next_level}</li>
                            </ul>
                        )}
                        <p>submitTest... 🎉</p> 
                        </div>
            ) : (
                <div>
                    {questions.map((question, index) => (
                        <div key={question.id} style={{ marginBottom: "15px" }}>
                            <p>
                                <strong>question {index + 1}:</strong> {question.question}
                            </p>
                            <button
                                onClick={() => handleAnswer(question.id, "true")}
                                style={{
                                    marginRight: "10px",
                                    backgroundColor:
                                        answers[question.id] === "true" ? "#4CAF50" : "#f0f0f0",
                                }}
                            >
                                true
                            </button>
                            <button
                                onClick={() => handleAnswer(question.id, "false")}
                                style={{
                                    backgroundColor:
                                        answers[question.id] === "false" ? "#FF5733" : "#f0f0f0",
                                }}
                            >
                                false
                            </button>
                        </div>
                    ))}
                    <button
                        onClick={handleSubmit}
                        style={{
                            marginTop: "20px",
                            padding: "10px 20px",
                            backgroundColor: "#008CBA",
                            color: "white",
                            border: "none",
                            cursor: "pointer",
                        }}
                    >
                        submit
                    </button>


                </div>
            )
            }
            {message && <p style={{ color: "green" }}>{message}</p>}
        </div>

    )
}
export default Form_Test;
