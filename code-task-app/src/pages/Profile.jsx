import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "../api/axios";
import "../styles/Profile.css";
import "bootstrap/dist/css/bootstrap-grid.min.css";
import { useParams } from "react-router-dom";
import { 
  FaSave, FaTimes, FaSpinner, FaExclamationTriangle, 
  FaUserCircle, FaEnvelope, FaCalendarAlt, FaGraduationCap, 
  FaCertificate, FaCamera, FaListAlt 
} from "react-icons/fa";
import { CSSTransition, SwitchTransition } from "react-transition-group";
import { useAuth } from "../context/AuthContext";
import CropModal from "../components/CropModal";
import defaultProfile from "../assets/default-profile.png";

const Profile = () => {
  const { videoId } = useParams();
  const { user, updateUser } = useAuth();

  // Profile fields state
  const [user_id, setUser_id] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [joinDate, setJoinDate] = useState("");
  const [profilePhotoPath, setProfilePhotoPath] = useState(null);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Course state
  const [errorCourses, setErrorCourses] = useState("");
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [namecourse, setNameCourses] = useState("");
  const [progress, setProgress] = useState(0);
  const [completedtask, setCompletedtask] = useState(0);
  const [totalLessons, setTotalLessons] = useState(0);
  const [certificates, setCertificates] = useState(0);
  const [completedCourses, setCompletedCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showCourseName, setShowCourseName] = useState(false);

  // Progress circle animation
  const [animatedProgress, setAnimatedProgress] = useState(0);

  // Picture upload state
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewSource, setPreviewSource] = useState(null);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const fileInputRef = useRef(null);

  // Crop modal state
  const [showCropModal, setShowCropModal] = useState(false);

  // Transition refs for tabs
  const profileTabRef = useRef(null);
  const courseTabRef = useRef(null);
  const nodeRef = activeTab === "profile" ? profileTabRef : courseTabRef;

  // Animate progress circle when Course Progress tab is active
  useEffect(() => {
    if (activeTab === "course") {
      setAnimatedProgress(0);
      const timer = setTimeout(() => {
        setAnimatedProgress(validProgress);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [activeTab, progress]);

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (user?.id && activeTab === "course") {
      fetchCourses();
    }
  }, [user, activeTab]);

  useEffect(() => {
    let timer;
    if (error || message || errorCourses) {
      timer = setTimeout(() => {
        setError("");
        setMessage("");
        setErrorCourses("");
      }, 5000);
    }
    return () => clearTimeout(timer);
  }, [error, message, errorCourses]);

  useEffect(() => {
    if (profilePhotoPath) {
      const baseUrl = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";
      setProfilePhotoUrl(`${baseUrl}/storage/${profilePhotoPath}`);
    } else {
      setProfilePhotoUrl(null);
    }
  }, [profilePhotoPath]);

  useEffect(() => {
    if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewSource(reader.result);
      reader.readAsDataURL(selectedFile);
    } else {
      setPreviewSource(null);
    }
  }, [selectedFile]);

  const fetchProfile = async () => {
    setProfileLoading(true);
    setError("");
    setMessage("");
    try {
      const response = await axios.get("/profile");
      const userData = response.data.user;
      setUser_id(userData?.id);
      setName(userData?.name || "N/A");
      setUsername(userData?.username || "N/A");
      setEmail(userData?.email || "N/A");
      setJoinDate(userData?.created_at ? new Date(userData.created_at).toLocaleDateString() : "N/A");
      setProfilePhotoPath(userData?.profile_photo_path || null);
      updateUser(userData);
    } catch (err) {
      console.error("Failed to fetch profile:", err);
      setError("Failed to load profile information.");
    } finally {
      setProfileLoading(false);
    }
  };

 // ... inside fetchCourses:
 const fetchCourses = async () => {
  if (!user?.id) return;
  setCoursesLoading(true);
  setErrorCourses("");
  try {
    const response = await axios.get(`/user-progress/course-progress/${user.id}`);
    const info = response.data;
    // Use the merged title from the backend
    setNameCourses(info?.course_title || "Your Course");
    setProgress(info?.progress_percentage || 0);
    setCompletedtask(info?.completed_lessons || 0);
    setTotalLessons(Math.max(info?.total_lessons || 0, info?.completed_lessons || 0));
    setCertificates(info?.certificates_earned || 0);
    if ((info?.progress_percentage || 0) === 100) {
      const simulatedCourses = [
        { id: 1, name: info.course_title || "Your Course", totalLessons: Math.max(info?.total_lessons || 0, info?.completed_lessons || 0) },
      ];
      setCompletedCourses(simulatedCourses);
      setSelectedCourse(simulatedCourses[0].id);
    }
  } catch (err) {
    console.error("Failed to fetch courses:", err);
    setErrorCourses("Could not load course data.");
    setProgress(0);
  } finally {
    setCoursesLoading(false);
  }
};


  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");
    try {
      const response = await axios.put("/profile", { name, username, email });
      setMessage("Profile updated successfully!");
      setIsEditing(false);
      updateUser(response.data.user);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters long.");
      return;
    }
    setPasswordLoading(true);
    try {
      await axios.post("/change-password", { currentPassword, newPassword });
      setMessage("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update password. Check current password.");
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleFileSelect = (event) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
      setShowCropModal(true);
    }
  };

  const handlePictureUpload = async (fileToUpload) => {
    if (!fileToUpload) return;
    const formData = new FormData();
    formData.append("profile_picture", fileToUpload);
    setUploadingPicture(true);
    setError("");
    setMessage("");
    try {
      const response = await axios.post("/profile/picture", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (response.data.path) {
        setProfilePhotoPath(response.data.path);
        updateUser({ ...user, profile_photo_path: response.data.path });
      } else {
        await fetchProfile();
      }
      setSelectedFile(null);
      setPreviewSource(null);
      setMessage(response.data.message || "Picture updated successfully!");
    } catch (err) {
      console.error("Picture upload error:", err);
      setError(err.response?.data?.message || "Failed to upload picture. Please try again.");
    } finally {
      setUploadingPicture(false);
    }
  };

  const handleCropComplete = useCallback((croppedBlob) => {
    handlePictureUpload(croppedBlob);
    setShowCropModal(false);
  }, []);

  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const validProgress = Math.min(100, Math.max(0, Number(progress) || 0));
  const animatedOffset = circumference - (animatedProgress / 100) * circumference;

  const finalTotalLessons = Math.max(totalLessons, completedtask);
  const displayCompleted = Math.min(completedtask, finalTotalLessons);
  const displayCertificates = validProgress === 100 ? 1 : certificates;

  const renderSpinner = (size = "1em") => <FaSpinner className="spinner-icon" style={{ fontSize: size }} />;
  const displayImageUrl = previewSource || profilePhotoUrl || defaultProfile;

  if (profileLoading) {
    return (
      <div className="profile-page loading-state">
        {renderSpinner("2em")} <span>Loading Profile...</span>
      </div>
    );
  }

  if (error && !user_id) {
    return (
      <div className="profile-page error-state">
        <FaExclamationTriangle /> {error}
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-page-container">
        <header className="profile-header">
          <div className="profile-picture-container">
            <div className="profile-picture-wrapper" onClick={() => fileInputRef.current?.click()}>
              {displayImageUrl ? (
                <img src={displayImageUrl} alt="Profile" className="profile-picture" />
              ) : (
                <FaUserCircle className="profile-picture-placeholder" />
              )}
              <div className="profile-picture-overlay">
                <FaCamera />
                <span>Change</span>
              </div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/png, image/jpeg, image/gif"
              style={{ display: "none" }}
            />
            {selectedFile && (
              <div className="picture-actions">
                <button className="button primary small" onClick={() => handlePictureUpload(previewSource)} disabled={uploadingPicture}>
                  {uploadingPicture ? renderSpinner("0.8em") : <FaSave />} Save
                </button>
                <button className="button secondary small" onClick={() => setSelectedFile(null)} disabled={uploadingPicture}>
                  <FaTimes /> Cancel
                </button>
              </div>
            )}
          </div>
          <div className="profile-header-details">
            <h1 className="profile-name">{name}</h1>
            <p className="profile-username">@{username}</p>
            <div className="profile-meta">
              <span>
                <FaEnvelope /> {email}
              </span>
              <span>
                <FaCalendarAlt /> Joined: {joinDate}
              </span>
            </div>
          </div>
        </header>
        <nav className="profile-tabs">
          <button className={`tab-button ${activeTab === "profile" ? "active" : ""}`} onClick={() => setActiveTab("profile")}>
            Profile Settings
          </button>
          <button className={`tab-button ${activeTab === "course" ? "active" : ""}`} onClick={() => setActiveTab("course")}>
            Course Progress
          </button>
        </nav>
        <main className="tab-content">
          <SwitchTransition mode="out-in">
            <CSSTransition key={activeTab} nodeRef={nodeRef} timeout={300} classNames="tab-fade" unmountOnExit>
              <div ref={nodeRef} className="tab-pane-wrapper">
                {activeTab === "profile" && (
                  <section className="profile-settings-section">
                    <h2>Update Profile</h2>
                    <form onSubmit={handleSave}>
                      <div className="form-field">
                        <label htmlFor="name">Name</label>
                        <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} />
                      </div>
                      <div className="form-field">
                        <label htmlFor="username">Username</label>
                        <input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
                      </div>
                      <div className="form-field">
                        <label htmlFor="email">Email</label>
                        <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                      </div>
                      <button className="button primary" type="submit" disabled={loading}>
                        {loading ? "Saving..." : "Save Changes"}
                      </button>
                    </form>
                    {message && <div className="form-message success">{message}</div>}
                    {error && <div className="form-message error">{error}</div>}
                    <hr />
                    <h2>Change Password</h2>
                    <form onSubmit={handleChangePassword}>
                      <div className="form-field">
                        <label htmlFor="currentPassword">Current Password</label>
                        <input
                          id="currentPassword"
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                        />
                      </div>
                      <div className="form-field">
                        <label htmlFor="newPassword">New Password</label>
                        <input
                          id="newPassword"
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                        />
                      </div>
                      <div className="form-field">
                        <label htmlFor="confirmPassword">Confirm New Password</label>
                        <input
                          id="confirmPassword"
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                      </div>
                      <button className="button primary" type="submit" disabled={passwordLoading}>
                        {passwordLoading ? "Changing..." : "Change Password"}
                      </button>
                    </form>
                  </section>
                )}
                {activeTab === "course" && (
                  <section className="course-progress-section">
                    <h2 className="section-title">
                      {validProgress === 100 ? (
                        <>
                          <span className="completed-courses-header">
                            <FaListAlt className="course-dropdown-icon" />
                            Completed Courses
                          </span>
                          <button onClick={() => setShowCourseName(!showCourseName)} className="toggle-course-btn">
                            {showCourseName ? "▲" : "▼"}
                          </button>
                        </>
                      ) : (
                        "Course Progress"
                      )}
                    </h2>
                    {showCourseName && validProgress === 100 && (
                      <div className="completed-course-details">
                        {completedCourses.length > 0 ? (
                          completedCourses.map((course) => (
                            <div key={course.id} className="completed-course-item" onClick={() => setSelectedCourse(course.id)}>
                              {course.name}
                            </div>
                          ))
                        ) : (
                          <p>{namecourse}</p>
                        )}
                      </div>
                    )}
                    {validProgress === 100 && (
                      <div className="selected-course-header">
                        <FaGraduationCap className="lessons-icon" />
                        <span>
                          {selectedCourse
                            ? completedCourses.find((c) => c.id === selectedCourse)?.name
                            : namecourse}
                        </span>
                      </div>
                    )}
                    {coursesLoading && (
                      <div className="loading-state course-loading">
                        {renderSpinner("1.5em")} <span>Loading Course Data...</span>
                      </div>
                    )}
                    {errorCourses && !coursesLoading && (
                      <div className="form-message error course-error">
                        <FaExclamationTriangle /> {errorCourses}
                      </div>
                    )}
                    {!coursesLoading && !errorCourses && finalTotalLessons > 0 && (
                      <div className="course-details-card">
                        <div className="progress-and-stats">
                          <div className="progress-circle-wrapper">
                            <svg className="progress-ring" viewBox="0 0 120 120">
                              <circle className="progress-ring-bg" cx="60" cy="60" r={radius} />
                              <circle
                                className="progress-ring-bar"
                                cx="60" cy="60" r={radius}
                                style={{ strokeDasharray: circumference, strokeDashoffset: animatedOffset }}
                              />
                            </svg>
                            <div className="progress-text">{animatedProgress}%</div>
                          </div>
                          <div className="course-stats">
                            <div className="stat-item">
                              <FaGraduationCap className="lessons-icon" />
                              <span>Completed Lessons</span>
                              <strong>{displayCompleted} / {Math.max(totalLessons, completedtask)}</strong>
                            </div>
                            <div className="stat-item">
                              <FaCertificate />
                              <span>Certificates Earned</span>
                              <strong>{displayCertificates}</strong>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    {!coursesLoading && !errorCourses && Math.max(totalLessons, completedtask) === 0 && (
                      <div className="form-message info">
                        No active course data found or course has no lessons.
                      </div>
                    )}
                  </section>
                )}
              </div>
            </CSSTransition>
          </SwitchTransition>
        </main>
      </div>

      {showCropModal && (
        <CropModal 
          imageSrc={previewSource} 
          onComplete={handleCropComplete} 
          onCancel={() => setShowCropModal(false)} 
        />
      )}
    </div>
  );
};

export default Profile;
