import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import "../styles/Profile.css";
//import 'bootstrap/dist/css/bootstrap.min.css';
import { useParams } from "react-router-dom";

const Profile = () => {
    const { videoId } = useParams();
    const [user_id, setUser_id] = useState("");
    const [name, setName] = useState("");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [joinDate, setJoinDate] = useState("");
    const [oldpassword, setOldPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const [activeTab, setActiveTab] = useState("profile");
    // changed password
    const [isEditing, setIsEditing] = useState(false);
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    // courses information
    const VIDEO_DURATION = 14400;
    const [error1, setError1] = useState("");
    const [namecourse, setnameCourses] = useState("")
    const [progress, setProgress] = useState(""); // نسبة التقدم
    const [completedtask, setCompletedtask] = useState();
    const [totalLessons, setTotalLessons] = useState(20);
    const [certificates, setCertificates] = useState(2);

    useEffect(() => {
        fetchProfile();
        fetchCourses();
        if (error || message) {
            const timer = setTimeout(() => {
                setError("");
                setMessage("");
            }, 10000);

            return () => clearTimeout(timer);
        }
    }, [error, message]);

    async function fetchProfile() {
        try {
            const response = await axios.get("/profile");
            const userData = response.data.user;
            setUser_id(userData?.id);
            setName(userData?.name || "");
            setUsername(userData?.username || "");
            setEmail(userData?.email || "");
            setJoinDate((userData?.created_at || "2023-01-01").split("T")[0]); // يمكنك تعديل التاريخ الافتراضي
            setOldPassword(userData?.password)
        } catch (err) {
            console.error("Failed to fetch profile:", err);
            setError("Failed to fetch profile:", err);
        }
    }
    async function fetchCourses() {
        try {
            const response = await axios.get(`user-progress/user/${user_id || "all"}`)
            const information =response.data;
            setCompletedtask (information?.completed_tasks?.length  ||" ")
            
            setLoading(false);
        }
        catch {
            setError1('An error occurred while fetching data');
            setLoading(false);
        };
    };
    const handleSave = async () => {
        setLoading(true);
        setMessage("");
        setError("");

        try {
            await axios.put("/profile", {
                name,
                username,
                email,
            });
            setMessage("Profile updated successfully!");
            setActiveTab("profile");
        } catch (err) {
            setError("Failed to update profile.");
        } finally {
            setLoading(false);
        }
    };
    const handleChangePassword = async () => {
        if (oldpassword !== currentPassword) {
            setError("Old password error")
            return;
        }
        if (newPassword !== confirmPassword) {
            setError("New passwords do not match.");
            return;
        }

        try {
            await axios.post("/profile", {
                newPassword,
            });
            setMessage("Password updated successfully!");
            setError("");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setShowPasswordForm(false);
        } catch (err) {
            setError("Failed to update password.");
        }
    };


    //Progressive Circuit Settings
    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    const progressOffset = circumference - (progress / 100) * circumference;

    return (
        <div className="container mx-auto p-8">
            {/* Header section with picture and details*/}
            <div className="d-flex align-items-center bg-white shadow-lg rounded-lg p-4 mb-4">
                <img
                    src="/path/to/profile-image.jpg"
                    alt="Profile"
                    className="profile-img rounded-circle"
                    style={{ width: "120px", height: "120px", objectFit: "cover" }}
                />
                <div className="ms-4">
                    <h2 className="mb-1">{name || "UserName"}</h2>
                    <p className="mb-0">{email || "Email"}</p>
                    <p className="mb-0"> join Date: {joinDate}</p>
                </div>
            </div>

            {/*navbar */}
            <ul className="nav nav-tabs mb-4">
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeTab === "profile" ? "active" : ""}`}
                        onClick={() => setActiveTab("profile")}
                    >
                        Personal information
                    </button>
                </li>
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeTab === "course" ? "active" : ""}`}
                        onClick={() => setActiveTab("course")}
                    >
                        course information
                    </button>
                </li>
            </ul>

            {activeTab === "profile" && (
                <div className="bg-white shadow-lg rounded-lg p-4 scroll-container">
                    {/* Error or success messages*/}
                    {(error || message) && (
                        <div className="mb-3">
                            {error && <div className="alert alert-danger">{error}</div>}
                            {message && <div className="alert alert-success">{message}</div>}
                        </div>
                    )}

                    <div className="row">
                        {/* Personal Information Column */}
                        <div className={`col-md-${showPasswordForm ? "6" : "12"} border-end pe-4`}>
                            <h4 className="mb-4">Personal Information</h4>

                            {isEditing ? (
                                <>
                                    <div className="mb-3">
                                        <label>Name:</label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="form-control"
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label>Username:</label>
                                        <input
                                            type="text"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            className="form-control"
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label>Email:</label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="form-control"
                                        />
                                    </div>

                                    <button
                                        className="btn btn-success me-2"
                                        onClick={handleSave}
                                        disabled={loading}
                                    >
                                        {loading ? "Loading..." : "Save"}
                                    </button>
                                    <button
                                        className="btn btn-secondary"
                                        onClick={() => {
                                            setIsEditing(false);
                                            fetchProfile();
                                        }}
                                    >
                                        Cancel
                                    </button>
                                </>
                            ) : (
                                <>
                                    <p><strong>Name:</strong> {name}</p>
                                    <p><strong>Username:</strong> {username}</p>
                                    <p><strong>Email:</strong> {email}</p>
                                    <button
                                        className="btn btn-primary me-4"
                                        onClick={() => setIsEditing(true)}
                                    >
                                        Edit Information
                                    </button>
                                    {/* Show/Hide Change Password Button */}
                                    <button
                                        className={`btn ${showPasswordForm ? "btn-outline-secondary" : "btn-outline-warning"} mt-1`}
                                        onClick={() => setShowPasswordForm(!showPasswordForm)}
                                    >
                                        {showPasswordForm ? "Hide Password Settings" : "Change Password"}
                                    </button>
                                </>
                            )}


                        </div>

                        {/* Change Password Column*/}
                        {showPasswordForm && (
                            <div className="col-md-6 ps-4">
                                <div className="alert alert-warning">
                                    <h5 className="alert-heading mb-3">Change Password</h5>

                                    <div className="mb-3">
                                        <label>Current Password:</label>
                                        <input
                                            type="password"
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            className="form-control"
                                            placeholder="Enter current password"
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label>New Password:</label>
                                        <input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="form-control"
                                            placeholder="Enter new password"
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label>Confirm New Password:</label>
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="form-control"
                                            placeholder="Confirm new password"
                                        />
                                    </div>

                                    <button className="btn btn-dark" onClick={handleChangePassword}>
                                        Update Password
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}


            {activeTab === "course" && (
                <div className="bg-white shadow-lg rounded-lg p-6 text-center">
                    <h3 className="mb-4">Courses Details</h3>

                    {/* حالة التحميل */}
                    {loading && (
                        <div className="mb-4">
                            <div className="progress" style={{ height: "20px" }}>
                                <div
                                    className="progress-bar progress-bar-striped progress-bar-animated"
                                    style={{ width: `${progress}%` }}
                                    role="progressbar"
                                    aria-valuenow={progress}
                                    aria-valuemin="0"
                                    aria-valuemax="100"
                                >
                                    {progress}%
                                </div>
                            </div>
                        </div>
                    )}

                    {/* رسالة خطأ */}
                    {error1 && <div className="alert alert-danger">{error1}</div>}

                    {/* بيانات الدورة */}
                    {!loading && !error1 && (
                        <>
                            <p className="mb-3 fw-bold">Course Name: {namecourse}</p>
                            <div
                                className="progress-circle mx-auto mb-3"
                                style={{ position: "relative", width: "120px", height: "120px" }}
                            >
                                <svg width="120" height="120">
                                    <circle
                                        cx="60"
                                        cy="60"
                                        r={radius}
                                        fill="none"
                                        stroke="#ddd"
                                        strokeWidth="10"
                                    />
                                    <circle
                                        cx="60"
                                        cy="60"
                                        r={radius}
                                        fill="none"
                                        stroke="#4285f4"
                                        strokeWidth="10"
                                        strokeDasharray={circumference}
                                        strokeDashoffset={progressOffset}
                                        strokeLinecap="round"
                                        style={{ transition: "stroke-dashoffset 0.5s ease-out" }}
                                    />
                                </svg>
                                <div
                                    style={{
                                        position: "absolute",
                                        top: "50%",
                                        left: "50%",
                                        transform: "translate(-50%, -50%)",
                                        fontSize: "18px",
                                        fontWeight: "bold"
                                    }}
                                >
                                    {progress}%
                                </div>
                            </div>
                            <p>📚 Completed tasks: {completedtask}</p>
                            <p>🎓 Earned certificates: {certificates}</p>
                        </>
                    )}
                </div>
            )}


        </div>
    );
};


export default Profile;
