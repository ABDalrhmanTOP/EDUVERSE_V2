// src/components/CoursesDashboard.jsx
import React, { useEffect, useState } from "react";
import apiClient from '../../api/axios';
import { useNavigate, Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import Slider from "react-slick";
import { ProgressBar } from "react-bootstrap";
import { useAuth } from "../../context/AuthContext";
import { FaSync } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "../../styles/admin/CoursesDashboard.css"; // custom CSS for dashboard

const VIDEO_DURATION = 112049; // example duration

// This component displays the admin progress table.
const UserProgressTable = () => {
  const [usersProgress, setUsersProgress] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    apiClient.get(`user-progress/user/all`)
      .then(response => {
        setUsersProgress(response.data);
        setError(null);
      })
      .catch(error => {
        setError(t('common.failedToLoad'));
        setUsersProgress([]);
      })
      .finally(() => setLoading(false));
  }, [t]);

  // Converts a timestamp string (d:hh:mm:ss, hh:mm:ss, etc.) to seconds.
  const convertToSeconds = (timeString) => {
    if (!timeString) return 0;
    const parts = timeString.split(":").map(Number);
    if (parts.length === 4) {
      const [days, hours, minutes, seconds] = parts;
      return days * 86400 + hours * 3600 + minutes * 60 + seconds;
    } else if (parts.length === 3) {
      const [hours, minutes, seconds] = parts;
      return hours * 3600 + minutes * 60 + seconds;
    } else if (parts.length === 2) {
      const [minutes, seconds] = parts;
      return minutes * 60 + seconds;
    } else {
      return Number(parts[0]);
    }
  };

  const calculateProgress = (timestamp) => {
    const seconds = convertToSeconds(timestamp);
    if (!seconds || seconds <= 0) return 0;
    const percentage = (seconds * 100) / VIDEO_DURATION;
    return percentage.toFixed(2);
  };

  return (
    <div className="admin-progress-table container my-4 p-4 bg-white rounded shadow" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
      <h2 className="mb-4 text-center text-primary fw-bold">{t('common.userProgressManagement')}</h2>
      {loading ? (
        <div className="alert alert-info text-center">{t('common.loading')}</div>
      ) : error ? (
        <div className="alert alert-danger text-center">{error}</div>
      ) : (
        <div className="table-responsive mt-3">
          <table className="table table-striped table-hover table-bordered text-center">
            <thead className="table-dark">
              <tr>
                <th>{t('common.userId')}</th>
                <th>{t('common.videoId')}</th>
                <th>{t('common.lastTimestamp')}</th>
                <th>{t('common.completion')}</th>
                <th>{t('common.completedTasks')}</th>
              </tr>
            </thead>
            <tbody>
              {usersProgress.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center text-muted">{t('common.noDataAvailable')}</td>
                </tr>
              ) : (
                usersProgress.map((user, index) => {
                  const progress = calculateProgress(user.last_timestamp);
                  return (
                    <tr key={index}>
                      <td>{user.user_id}</td>
                      <td>{user.video_id}</td>
                      <td>{user.last_timestamp}</td>
                      <td>
                        <div className="d-flex flex-column align-items-center">
                          <span className="fw-bold">{progress}%</span>
                          <ProgressBar 
                            now={progress} 
                            variant={progress > 75 ? "success" : progress > 50 ? "warning" : "danger"} 
                            style={{ width: "150px", height: "10px" }}
                          />
                        </div>
                      </td>
                      <td>{user.completed_tasks?.length > 0 ? user.completed_tasks.join(", ") : t('common.noTasksCompleted')}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
      <div className="text-center mt-4">
        <button className="btn btn-secondary px-4 py-2" onClick={() => navigate(`/AdminDashboard/users`)}>
          {t('common.backToUsers')}
        </button>
      </div>
    </div>
  );
};

// This component displays available courses (playlists) with average rating.
const Playlists = () => {
  const [playlists, setPlaylists] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { t, i18n } = useTranslation();

  const fetchPlaylists = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await apiClient.get("/admin/courses");
      setPlaylists(response.data || []);
    } catch (err) {
      setError(t('common.failedToLoadCourses'));
    } finally {
      setLoading(false);
    }
  };

  const refreshPlaylists = async () => {
    setRefreshing(true);
    await fetchPlaylists();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchPlaylists();
  }, [t]);

  // Group courses by year and semester
  const groupCourses = (courses) => {
    const grouped = {};
    courses.forEach(course => {
      const key = t('admin.courses.yearSemester', { year: course.year, semester: course.semester });
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(course);
    });
    return grouped;
  };

  const groupedCourses = groupCourses(playlists);

  return (
    <div className="user-courses-container" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="user-courses-header">
        <h2 className="user-courses-title">
          {t('common.availableCourses')}
        </h2>
        <button 
          className="courses-list-refresh-btn"
          onClick={refreshPlaylists}
          disabled={refreshing}
        >
          <FaSync className={refreshing ? 'spinning' : ''} />
          {refreshing ? t('common.refreshing') : t('common.refresh')}
        </button>
      </div>
      {error && <p className="user-error-message">{error}</p>}
      {loading ? (
        <div className="user-loading-container">
          <div className="user-loading-spinner"></div>
          <p>{t('common.loadingCourses')}</p>
        </div>
      ) : (
        <div className="user-courses-grid">
          {Object.entries(groupedCourses).map(([group, groupCourses], idx) => (
            <div key={group} className="user-course-group">
              <h3 className="user-course-group-title">{group}</h3>
              <div className="user-courses-row">
                {groupCourses.map((playlist, i) => (
                  <motion.div 
                    key={playlist.id} 
                    initial={{ opacity: 0, y: 30 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: i * 0.1 }}
                    className="user-course-card-wrapper"
                  >
                    <PlaylistCard playlist={playlist} />
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
          {Object.keys(groupedCourses).length === 0 && (
            <p className="user-no-courses-message">
              {t('common.noCoursesAvailable')}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

const PlaylistCard = ({ playlist }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleCourses = () => {
    if (!isAuthenticated) {
      navigate("/login");
    } else {
      navigate("/foem_test");
    }
  };

  // Extract YouTube video ID if a full URL is provided
  const extractYouTubeId = (idOrUrl) => {
    if (!idOrUrl) return '';
    // If it's a full URL, extract the ID
    const match = idOrUrl.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/);
    if (match) return match[1];
    // If it's already an ID
    if (/^[\w-]{11}$/.test(idOrUrl)) return idOrUrl;
    return '';
  };
  const videoId = extractYouTubeId(playlist.video_id || playlist.videoId);
  const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : '';

  return (
    <motion.div
      className="user-playlist-card"
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleCourses}
    >
      <div className="user-card-thumbnail-container">
        <img
          src={thumbnailUrl}
          alt={playlist.name}
          className="user-card-thumbnail"
        />
        <div className="user-card-overlay">
          <div className="user-card-content">
            <h3 className="user-card-title">{playlist.name}</h3>
            <p className="user-card-description">{playlist.description || t('common.noDescriptionAvailable')}</p>
            <div className="user-card-rating">
              ⭐ {playlist.average_rating ? playlist.average_rating.toFixed(1) : "N/A"}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCourses();
              }}
              className="user-watch-btn"
            >
              🎬 {t('common.watchCourse')}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const CoursesDashboard = () => {
  const { isAdmin } = useAuth(); // assume isAdmin flag from auth context

  return (
    <>
      <Playlists />
      {isAdmin && <UserProgressTable />}
      <Outlet />
    </>
  );
};

export default CoursesDashboard;
