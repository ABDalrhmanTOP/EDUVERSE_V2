import React, { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaArrowLeft, 
  FaUser, 
  FaEnvelope, 
  FaCalendar, 
  FaGraduationCap, 
  FaBriefcase, 
  FaMapMarkerAlt, 
  FaStar,
  FaCheckCircle,
  FaClock,
  FaEdit,
  FaTrash,
  FaEye,
  FaBook,
  FaCode,
  FaChalkboardTeacher,
  FaFlask,
  FaUniversity,
  FaGlobe,
  FaHeart,
  FaLightbulb,
  FaFire,
  FaTrophy,
  FaPlay,
  FaPause,
  FaCamera,
  FaTimes,
  FaCrop,
  FaSave,
  FaSpinner
} from "react-icons/fa";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import apiClient from "../../api/axios";
import UserForm from "./UserForm";
import CropModal from "../CropModal";
import "../../styles/admin/UserDetail.css";

const UserDetail = () => {
  const { t, i18n } = useTranslation();
  const { user_id } = useParams();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);
  const [usersProgress, setUsersProgress] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [showEditForm, setShowEditForm] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  
  // Profile picture state (using Profile component logic)
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewSource, setPreviewSource] = useState(null);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const fileInputRef = useRef(null);

  // Move fetchData outside useEffect
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        // Fetch user profile
        const profileResponse = await apiClient.get(`/admin/users/${user_id}`);
        setUserProfile(profileResponse.data);
        // Fetch user progress
      let progressResponse;
      try {
        progressResponse = await apiClient.get(`/admin/user-progress/user/${user_id}`);
        setUsersProgress(progressResponse.data || []);
      } catch (progressError) {
        if (progressError.response && progressError.response.status === 404) {
          setUsersProgress([]); // No progress found, not a hard error
        } else {
          throw progressError;
        }
      }
      } catch (error) {
      setError(t('admin.messages.failedToLoad'));
        setUserProfile(null);
        setUsersProgress([]);
      } finally {
        setLoading(false);
      }
    };
    
  useEffect(() => {
    fetchData();
  }, [user_id]);

  // Profile picture preview effect
  useEffect(() => {
    if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewSource(reader.result);
      reader.readAsDataURL(selectedFile);
    } else {
      setPreviewSource(null);
    }
  }, [selectedFile]);

  const formatDate = (dateString) => {
    if (!dateString) return t('admin.users.notSpecified');
    return new Date(dateString).toLocaleDateString(i18n.language === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      calendar: 'gregory'
    });
  };

  const parseArrayField = (field) => {
    if (!field) return [];
    try {
      const parsed = JSON.parse(field);
      return Array.isArray(parsed) ? parsed : [field];
    } catch (e) {
      return [field];
    }
  };

  const getJobIcon = (job) => {
    switch (job?.toLowerCase()) {
      case 'student': return <FaGraduationCap />;
      case 'software engineer': return <FaCode />;
      case 'teacher': return <FaChalkboardTeacher />;
      case 'researcher': return <FaFlask />;
      default: return <FaBriefcase />;
    }
  };

  const calculateProgressPercentage = (progress) => {
    if (!progress.last_timestamp || !progress.video_duration) return 0;
    const currentTime = parseFloat(progress.last_timestamp);
    const totalTime = parseFloat(progress.video_duration);
    return Math.min(Math.round((currentTime / totalTime) * 100), 100);
  };

  const handleEditSuccess = (message, isError = false) => {
    if (!isError) {
      // Refresh user data
      fetchData();
    }
    setShowEditForm(false);
  };

  // Profile picture handlers (using Profile component logic)
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
    try {
      const response = await apiClient.post(`/admin/users/${user_id}/profile-picture`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (response.data.profile_photo_path) {
        setUserProfile(prev => ({
          ...prev,
          profile_photo_path: response.data.profile_photo_path
        }));
      }
      setSelectedFile(null);
      setPreviewSource(null);
    } catch (err) {
      setError(t('admin.messages.failedToUpload'));
    } finally {
      setUploadingPicture(false);
    }
  };

  const handleCropComplete = useCallback((croppedBlob) => {
    handlePictureUpload(croppedBlob);
    setShowCropModal(false);
  }, []);

  const getStreakInfo = (progress) => {
    // Mock streak calculation - you can implement real logic based on your data
    const lastActivity = progress.updated_at ? new Date(progress.updated_at) : null;
    const today = new Date();
    const daysSinceLastActivity = lastActivity ? Math.floor((today - lastActivity) / (1000 * 60 * 60 * 24)) : 999;
    
    if (daysSinceLastActivity === 0) return { days: 1, status: 'active' };
    if (daysSinceLastActivity === 1) return { days: 2, status: 'active' };
    if (daysSinceLastActivity <= 3) return { days: 3, status: 'warning' };
    return { days: 0, status: 'inactive' };
  };

  const renderSpinner = (size = "1em") => <FaSpinner className="spinner-icon" style={{ fontSize: size }} />;

  if (loading) {
    return (
      <div className="user-detail-loading">
        <div className="user-detail-spinner"></div>
        <p>{t('admin.messages.loadingUserDetails')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-detail-error">
        <h3>{t('admin.messages.errorLoadingUser')}</h3>
        <p>{error}</p>
        <button onClick={() => navigate('/AdminDashboard/users')} className="user-detail-back-btn">
          <FaArrowLeft /> {t('admin.users.backToUsers')}
        </button>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="user-detail-error">
        <h3>{t('admin.messages.userNotFound')}</h3>
        <p>{t('admin.messages.userNotFoundDesc')}</p>
        <button onClick={() => navigate('/AdminDashboard/users')} className="user-detail-back-btn">
          <FaArrowLeft /> {t('admin.users.backToUsers')}
        </button>
      </div>
    );
  }

  return (
    <div className="user-detail-container" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="user-detail-header">
        <motion.button
          onClick={() => navigate('/AdminDashboard/users')}
          className="user-detail-back-btn"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FaArrowLeft /> {t('admin.users.backToUsers')}
        </motion.button>
        <div className="user-detail-title-section">
          <h1>{t('admin.users.userDetails')}</h1>
          <p>{t('admin.users.userProfile')}</p>
        </div>
        <div className="user-detail-actions">
          <motion.button
            className="user-detail-edit-btn"
            onClick={() => setShowEditForm(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaEdit /> {t('admin.users.editUser')}
          </motion.button>
        </div>
      </div>

      {/* User Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="user-detail-profile-card"
      >
        <div className="user-detail-avatar-section">
          <div className="user-detail-avatar-container">
            <div 
              className="user-detail-avatar"
              onClick={() => userProfile.profile_photo_path && setShowImagePreview(true)}
              style={{ cursor: userProfile.profile_photo_path ? 'pointer' : 'default' }}
            >
              {userProfile.profile_photo_path ? (
                <img 
                  src={`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000'}/storage/${userProfile.profile_photo_path}`}
                  alt={userProfile.name || 'User'} 
                  className="user-profile-image"
                />
              ) : (
                <span className="user-avatar-text">
            {userProfile.name ? userProfile.name.charAt(0).toUpperCase() : 'U'}
                </span>
              )}
              {userProfile.profile_photo_path && (
                <div className="avatar-overlay">
                  <FaEye />
                </div>
              )}
            </div>
            <motion.button
              className="user-detail-avatar-upload-btn"
              onClick={() => fileInputRef.current?.click()}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title={t('admin.users.changeProfilePicture')}
              disabled={uploadingPicture}
            >
              {uploadingPicture ? renderSpinner("1rem") : <FaCamera />}
            </motion.button>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              accept="image/png, image/jpeg, image/gif"
              style={{ display: 'none' }}
            />
          </div>
          <div className="user-detail-basic-info">
            <h2>{userProfile.name || t('admin.users.unnamedUser')}</h2>
            <p className="user-detail-email">
              <FaEnvelope /> {userProfile.email}
            </p>
            <div className="user-detail-badges">
              <span className={`user-detail-role-badge ${userProfile.role || 'user'}`}>
                {userProfile.role || 'user'}
              </span>
              <span className={`user-detail-status-badge ${userProfile.email_verified_at ? 'verified' : 'pending'}`}>
                {userProfile.email_verified_at ? <FaCheckCircle /> : <FaClock />}
                {userProfile.email_verified_at ? t('admin.users.verified') : t('admin.users.pending')}
              </span>
            </div>
          </div>
        </div>

        <div className="user-detail-stats">
          <div className="user-detail-stat">
            <FaCalendar />
            <div>
              <span className="stat-label">{t('admin.users.joined')}</span>
              <span className="stat-value">{formatDate(userProfile.created_at)}</span>
            </div>
          </div>
          <div className="user-detail-stat">
            <FaBook />
            <div>
              <span className="stat-label">{t('admin.users.coursesProgress')}</span>
              <span className="stat-value">{usersProgress.length} {t('admin.users.course')}</span>
            </div>
          </div>
          <div className="user-detail-stat">
            <FaStar />
            <div>
              <span className="stat-label">{t('admin.users.formCompleted')}</span>
              <span className="stat-value">
                {userProfile.has_completed_general_form ? t('common.yes') : t('common.no')}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="user-detail-tabs">
        <button
          className={`user-detail-tab ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <FaUser /> {t('admin.users.profileInformation')}
        </button>
        <button
          className={`user-detail-tab ${activeTab === 'progress' ? 'active' : ''}`}
          onClick={() => setActiveTab('progress')}
        >
          <FaBook /> {t('admin.users.courseProgress')}
        </button>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'profile' && (
          <motion.div
            key="profile"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="user-detail-tab-content"
          >
      <div className="user-detail-grid">
        {/* Basic Information */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="user-detail-section"
        >
                <h3><FaUser /> {t('admin.users.basicInformation')}</h3>
          <div className="user-detail-info-grid">
            <div className="info-item">
                    <span className="info-label">{t('admin.users.fullName')}</span>
                    <span className="info-value">{userProfile.name || t('admin.users.notSpecified')}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">{t('admin.users.username')}</span>
                    <span className="info-value">{userProfile.username || t('admin.users.notSpecified')}</span>
            </div>
            <div className="info-item">
                    <span className="info-label">{t('admin.users.email')}</span>
              <span className="info-value">{userProfile.email}</span>
            </div>
            <div className="info-item">
                    <span className="info-label">{t('admin.users.role')}</span>
              <span className="info-value">{userProfile.role || 'user'}</span>
            </div>
          </div>
        </motion.div>

        {/* Professional Information */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="user-detail-section"
        >
                <h3><FaBriefcase /> {t('admin.users.professionalInformation')}</h3>
          <div className="user-detail-info-grid">
            <div className="info-item">
                    <span className="info-label">{t('admin.users.jobTitle')}</span>
                    <span className="info-value">
                      {getJobIcon(userProfile.job)}
                      {userProfile.job || t('admin.users.notSpecified')}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">{t('admin.users.experienceLevel')}</span>
                    <span className="info-value">{userProfile.experience || t('admin.users.notSpecified')}</span>
            </div>
            <div className="info-item">
                    <span className="info-label">{t('admin.users.yearsOfExperience')}</span>
                    <span className="info-value">{userProfile.years_of_experience || t('admin.users.notSpecified')}</span>
            </div>
              <div className="info-item">
                    <span className="info-label">{t('admin.users.specialization')}</span>
                    <span className="info-value">{userProfile.specialization || t('admin.users.notSpecified')}</span>
              </div>
                <div className="info-item">
                    <span className="info-label">{t('admin.users.industry')}</span>
                    <span className="info-value">{userProfile.industry || t('admin.users.notSpecified')}</span>
                </div>
                <div className="info-item">
                    <span className="info-label">{t('admin.users.companySize')}</span>
                    <span className="info-value">{userProfile.company_size || t('admin.users.notSpecified')}</span>
                </div>
                <div className="info-item">
                    <span className="info-label">{t('admin.users.teachingSubject')}</span>
                    <span className="info-value">{userProfile.teaching_subject || t('admin.users.notSpecified')}</span>
                </div>
                <div className="info-item">
                    <span className="info-label">{t('admin.users.researchField')}</span>
                    <span className="info-value">{userProfile.research_field || t('admin.users.notSpecified')}</span>
              </div>
          </div>
        </motion.div>

        {/* Education Information */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="user-detail-section"
        >
                <h3><FaGraduationCap /> {t('admin.users.educationInformation')}</h3>
          <div className="user-detail-info-grid">
            <div className="info-item">
                    <span className="info-label">{t('admin.users.university')}</span>
                    <span className="info-value">{userProfile.university || t('admin.users.notSpecified')}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">{t('admin.users.educationLevel')}</span>
                    <span className="info-value">{userProfile.education_level || t('admin.users.notSpecified')}</span>
            </div>
            <div className="info-item">
                    <span className="info-label">{t('admin.users.fieldOfStudy')}</span>
                    <span className="info-value">{userProfile.field_of_study || t('admin.users.notSpecified')}</span>
            </div>
            <div className="info-item">
                    <span className="info-label">{t('admin.users.studentYear')}</span>
                    <span className="info-value">{userProfile.student_year || t('admin.users.notSpecified')}</span>
            </div>
            <div className="info-item">
                    <span className="info-label">{t('admin.users.semester')}</span>
                    <span className="info-value">{userProfile.semester || t('admin.users.notSpecified')}</span>
            </div>
          </div>
        </motion.div>

        {/* Personal Information */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="user-detail-section"
        >
                <h3><FaHeart /> {t('admin.users.personalInformation')}</h3>
          <div className="user-detail-info-grid">
            <div className="info-item">
                    <span className="info-label">{t('admin.users.country')}</span>
                    <span className="info-value">
                      <FaMapMarkerAlt />
                      {userProfile.country || t('admin.users.notSpecified')}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">{t('admin.users.careerGoals')}</span>
                    <span className="info-value">{userProfile.career_goals || t('admin.users.notSpecified')}</span>
            </div>
            <div className="info-item">
                    <span className="info-label">{t('admin.users.hobbies')}</span>
              <span className="info-value">
                {parseArrayField(userProfile.hobbies).length > 0 
                  ? parseArrayField(userProfile.hobbies).map((hobby, index) => (
                      <React.Fragment key={index}>
                        {React.createElement(FaBook, { className: "hobby-icon" })} {hobby}
                        {index < parseArrayField(userProfile.hobbies).length - 1 && ', '}
                      </React.Fragment>
                    ))
                        : t('admin.users.notSpecified')}
              </span>
            </div>
            <div className="info-item">
                    <span className="info-label">{t('admin.users.expectations')}</span>
              <span className="info-value">
                {parseArrayField(userProfile.expectations).length > 0
                  ? parseArrayField(userProfile.expectations).map((expectation, index) => (
                      <React.Fragment key={index}>
                        {React.createElement(FaLightbulb, { className: "expectation-icon" })} {expectation}
                        {index < parseArrayField(userProfile.expectations).length - 1 && ', '}
                      </React.Fragment>
                    ))
                        : t('admin.users.notSpecified')}
              </span>
            </div>
          </div>
        </motion.div>
      </div>
          </motion.div>
        )}

        {activeTab === 'progress' && (
        <motion.div
            key="progress"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="user-detail-tab-content"
          >
            {usersProgress.length === 0 ? (
              <div className="user-detail-no-progress">
                <FaBook className="no-progress-icon" />
                <h3>{t('admin.users.noCourseProgress')}</h3>
                <p>{t('admin.users.noCourseProgressDesc')}</p>
              </div>
            ) : (
          <div className="user-detail-progress-grid">
            {usersProgress.map((progress, index) => (
                  <motion.div
                    key={progress.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="user-detail-progress-card"
                  >
                <div className="progress-card-header">
                      <h4>{progress.course_name || t('admin.users.unknownCourse')}</h4>
                      <div className="progress-card-badges">
                        <span className="progress-badge">
                          <FaPlay /> {progress.video_id}
                        </span>
                        <span className="progress-badge">
                          <FaClock /> {progress.last_timestamp || '00:00'}
                        </span>
                      </div>
                </div>
                    
                <div className="progress-card-content">
                      <div className="progress-bar-container">
                        <div className="progress-bar">
                          <div 
                            className="progress-fill"
                            style={{ width: `${calculateProgressPercentage(progress)}%` }}
                          ></div>
                        </div>
                        <span className="progress-percentage">
                          {calculateProgressPercentage(progress)}%
                        </span>
                      </div>
                      
                  <div className="progress-stats">
                        <div className="progress-stat">
                          <FaCalendar />
                          <span>{t('admin.users.lastActivity')}: {formatDate(progress.updated_at)}</span>
                        </div>
                        <div className="progress-stat">
                          <FaTrophy />
                          <span>{t('admin.users.completedTasks')}: {progress.completed_tasks || 0}</span>
                  </div>
                </div>
              </div>
                  </motion.div>
            ))}
          </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Form Modal */}
      <AnimatePresence>
        {showEditForm && (
          <UserForm
            editingUser={userProfile}
            onSuccess={handleEditSuccess}
            onClose={() => setShowEditForm(false)}
          />
        )}
      </AnimatePresence>

      {/* Image Preview Modal */}
      <AnimatePresence>
        {showImagePreview && userProfile.profile_photo_path && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="image-preview-overlay"
            onClick={() => setShowImagePreview(false)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="image-preview-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="image-preview-close"
                onClick={() => setShowImagePreview(false)}
              >
                <FaTimes />
              </button>
              <img
                src={`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000'}/storage/${userProfile.profile_photo_path}`}
                alt={userProfile.name || 'User'}
                className="image-preview-img"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserDetail;