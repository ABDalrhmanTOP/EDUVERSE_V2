import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; 
import axios from "../api/axios";

function Form_Test() {
    const [questions, setQuestions] = useState([]); // لتخزين الأسئلة
    const [answers, setAnswers] = useState([]); // لتخزين الإجابات المؤقتة
    const [loading, setLoading] = useState(true); // حالة التحميل
    const [submitted, setSubmitted] = useState(false); // حالة الإرسال
    const [inputlevel, setInputLevel] = useState(1);
    const [message, setMessage] = useState("");
    const navigate = useNavigate(); 
    // جلب الأسئلة من API عند تحميل الصفحة
    useEffect(() => {
        const fetchQuestions = async () => {
        // const response = await axios.get(`/checkTestTaken/${inputlevel}`); 
        // if (response.data.taken) {
        //     alert("لقد أجريت هذا الاختبار سابقًا.");
        //     setSubmitted(true); // يتم تعيين حالة الإرسال لمنع تكرار الإجابات
        //     navigate("");
        // }else{
            try {
                if (inputlevel <= 3) {
                    const response = await axios.get(`/showTest/${inputlevel}`);
                    setQuestions(response.data.questions);
                    setLoading(false); // إذا كانت الأسئلة موجودة، قم بتعيينها
                } else {
                    setQuestions([]); // تعيين قائمة فارغة إذا لم تكن هناك أسئلة
                    alert("go to project");
                    setSubmitted(true);
                    navigate("");//يتم أضافة بين القوسين صفحة  وصف المشروع للذهاب اليها
                    setLoading(false);
                }
            } catch (error) {
                console.error("Error fetching questions:", error);
                setLoading(false);
           }
           
         }
        fetchQuestions();


    }, [inputlevel]);

    // تحديث الإجابة عند اختيار المستخدم
    const handleAnswer = async(questionId, answer) => {
        const updatedAnswers=({ ...answers, [questionId]: answer });
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
            if (response.data.next_level.id >=1) {
                setInputLevel(response.data.next_level.id); // تحديث المستوى إلى المستوى الجديد
               alert("Next Level")
            }
            } catch (error) {
                setMessage("Error sending answers");
                console.error(error?.response?.data || error.message);
            }


        };


        return (
            <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
                <h1>اختبار صح أو خطأ</h1>

                {loading ? (
                    <p>loading..</p>
                ) : submitted ? (
                    <p>submitTest... 🎉</p>
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
                                    صح
                                </button>
                                <button
                                    onClick={() => handleAnswer(question.id, "false")}
                                    style={{
                                        backgroundColor:
                                            answers[question.id] === "false" ? "#FF5733" : "#f0f0f0",
                                    }}
                                >
                                    خطأ
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
                            إرسال الإجابات
                        </button>


                    </div>
                )
                }
                {message && <p style={{ color: submitted ? "green" : "red" }}>{message}</p>}
            </div>
        )
    }
    export default Form_Test;
