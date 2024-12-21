import React, { useState, useEffect } from "react";
import axios from "../api/axios";

function Form_Test() {
    const [questions, setQuestions] = useState([]); // لتخزين الأسئلة
    const [answers, setAnswers] = useState({}); // لتخزين الإجابات المؤقتة
    const [loading, setLoading] = useState(true); // حالة التحميل
    const [submitted, setSubmitted] = useState(false); // حالة الإرسال

    // جلب الأسئلة من API عند تحميل الصفحة
    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const response = await axios.get("/showTest/1");
                setQuestions(response.data); // توقع أن الـ API يعيد مصفوفة من الأسئلة
                setLoading(false);
            } catch (error) {
                console.error("Error fetching questions:", error);
                setLoading(false);
            }
        };
        fetchQuestions();
       

    }, []);

    // تحديث الإجابة عند اختيار المستخدم
    const handleAnswer = (questionId, answer) => {
        setAnswers({ ...answers, [questionId]: answer });
    };

    // إرسال الإجابات إلى API
    const handleSubmit = async () => {
        try {
            await axios.post("/submitTest/{levelId}", { answers });
            setSubmitted(true);
        } catch (error) {
            console.error("Error submitting answers:", error);
        }
    };

    return (
        <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
            <h1>اختبار صح أو خطأ</h1>

            {loading ? (
                <p>جاري تحميل الأسئلة...</p>
            ) : submitted ? (
                <p>تم إرسال الإجابات بنجاح! 🎉</p>
            ) : (
                <div>
                    {questions.map((question, index) => (
                        <div key={question.id} style={{ marginBottom: "15px" }}>
                            <p>
                                <strong>سؤال {index + 1}:</strong> {question.text}
                            </p>
                            <button
                                onClick={() => handleAnswer(question.id, true)}
                                style={{
                                    marginRight: "10px",
                                    backgroundColor:
                                        answers[question.id] === true ? "#4CAF50" : "#f0f0f0",
                                }}
                            >
                                صح
                            </button>
                            <button
                                onClick={() => handleAnswer(question.id, false)}
                                style={{
                                    backgroundColor:
                                        answers[question.id] === false ? "#FF5733" : "#f0f0f0",
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
            )}
        </div>
    );
}

export default Form_Test;
