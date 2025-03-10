import React, { useEffect, useState } from "react";
import axios from "../api/axios"; // استيراد Axios
import "../styles/Profile.css";
import { useParams } from "react-router-dom";

const Profile = () => {
    const { videoId } = useParams();
    const [name, setName] = useState("");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [progress, setProgress] = useState(75); // نسبة التقدم
    const [completedLessons, setCompletedLessons] = useState(15);
    const [totalLessons, setTotalLessons] = useState(20);
    const [certificates, setCertificates] = useState(2);

    useEffect(() => {
        fetchProfile();
    }, []);

    async function fetchProfile() {
        try {
            const response = await axios.get("/profile");
            const userData = response.data.user;
            setName(userData?.name || "");
            setUsername(userData?.username || "");
            setEmail(userData?.email || "");
        } catch (err) {
            console.error("Failed to fetch profile:", err);
            setError("تعذر تحميل الملف الشخصي.");
        }
    }

    const handleSave = async () => {
        setLoading(true);
        setMessage("");
        setError("");
        try {
            await axios.put("/profile", {
                name,
                username,
                email,
                password,
            });
            setMessage("تم تحديث الملف الشخصي بنجاح!");
            setEditMode(false);
        } catch (err) {
            setError("فشل في تحديث الملف الشخصي.");
        } finally {
            setLoading(false);
        }
    };

    return (
       <div className="container mx-auto p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white shadow-lg rounded-lg p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">📁 ملفي الشخصي</h2>
                    {editMode ? (
                        <div className="space-y-4">
                            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2 border rounded-md" placeholder="الاسم" />
                            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full p-2 border rounded-md" placeholder="اسم المستخدم" />
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-2 border rounded-md" placeholder="البريد الإلكتروني" />
                            <button className="bg-blue-500 text-white px-4 py-2 rounded-md" onClick={() => setEditMode(false)}>حفظ</button>
                        </div>
                    ) : (
                        <div>
                            <p><strong>الاسم:</strong> {name}</p>
                            <p><strong>اسم المستخدم:</strong> {username}</p>
                            <p><strong>البريد الإلكتروني:</strong> {email}</p>
                            <button className="bg-blue-500 text-white px-4 py-2 rounded-md mt-4" onClick={() => setEditMode(true)}>تعديل الملف الشخصي</button>
                        </div>
                    )}
                </div>

                {/* 🟠 تقدم الكورس */}
                <div className="bg-white shadow-lg rounded-lg p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">📊 تقدم الكورس</h2>
                    <p className="text-lg font-semibold text-green-600">{progress}% مكتمل</p>
                    <div className="w-full bg-gray-200 rounded-full h-4 mt-2">
                        <div className="bg-green-500 h-4 rounded-full" style={{ width: `${progress}%` }}></div>
                    </div>
                    <p className="mt-4 text-gray-700">📚 الدروس المكتملة: {completedLessons} من {totalLessons}</p>
                    <p className="mt-2 text-gray-700">🎓 الشهادات المكتسبة: {certificates}</p>
                </div>
            </div>
        </div>
    );
};



export default Profile;
