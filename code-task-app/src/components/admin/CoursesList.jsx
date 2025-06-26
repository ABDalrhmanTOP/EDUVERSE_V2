import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaEdit, FaTrash, FaEye, FaBook, FaSync, FaTasks } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import CourseForm from './CourseForm';
import ConfirmationModal from './ConfirmationModal';
import SuccessNotification from './SuccessNotification';
import '../../styles/admin/CoursesList.css';

const CoursesList = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    courseId: null,
    courseName: ''
  });
  const [successNotification, setSuccessNotification] = useState({
    isVisible: false,
    message: '',
    type: 'success'
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get('/courses');
      setCourses(response.data || []);
    } catch (error) {
      setError('Failed to load courses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchCourses();
    setRefreshing(false);
  };

  const handleAddCourse = () => {
    setEditingCourse(null);
    setShowForm(true);
  };

  const handleEditCourse = (course) => {
    setEditingCourse(course);
    setShowForm(true);
  };

  const handleDeleteCourse = async (courseId) => {
    const course = courses.find(c => c.id === courseId);
    setDeleteModal({
      isOpen: true,
      courseId: courseId,
      courseName: course ? course.name : 'this course'
    });
  };

  const confirmDeleteCourse = async () => {
    try {
      await axios.delete(`/courses/${deleteModal.courseId}`);
      setCourses(courses.filter(course => course.id !== deleteModal.courseId));
      setDeleteModal({ isOpen: false, courseId: null, courseName: '' });
      
      // Show success notification
      setSuccessNotification({
        isVisible: true,
        message: `Course "${deleteModal.courseName}" has been successfully deleted.`,
        type: 'deleted'
      });
    } catch (error) {
      alert('Failed to delete course. Please try again.');
      setDeleteModal({ isOpen: false, courseId: null, courseName: '' });
    }
  };

  const handleCourseSuccess = () => {
    setShowForm(false);
    setEditingCourse(null);
    fetchCourses();
    
    // Show success notification
    setSuccessNotification({
      isVisible: true,
      message: editingCourse 
        ? `Course "${editingCourse.name}" has been successfully updated.`
        : 'New course has been successfully created.',
      type: editingCourse ? 'updated' : 'added'
    });
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingCourse(null);
  };

  const handleManageTasks = (courseId) => {
    navigate(`/AdminDashboard/tasks?course=${courseId}`);
  };

  // Extract YouTube video ID from URL or ID
  const extractVideoId = (videoId) => {
    if (!videoId) return '';
    // If it's already just an ID (11 characters), return it
    if (videoId.length === 11 && !videoId.includes('http')) {
      return videoId;
    }
    // Extract from URL
    const match = videoId.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/);
    return match ? match[1] : videoId;
  };

  // Group courses by year and semester
  const groupCourses = (courses) => {
    const grouped = {};
    courses.forEach(course => {
      const key = `Year ${course.year} - Semester ${course.semester}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(course);
    });
    return grouped;
  };

  const groupedCourses = groupCourses(courses);

  if (loading) {
    return (
      <div className="courses-list-loading">
        <div className="courses-list-spinner"></div>
        <p>Loading courses...</p>
      </div>
    );
  }

  return (
    <div className="courses-list-container">
      <div className="courses-list-header" style={{background: 'linear-gradient(135deg, #fffbe6 0%, #f3e8d3 100%)', borderRadius: '18px', boxShadow: '0 2px 12px rgba(184,134,11,0.08)', padding: '2rem 2rem 1.5rem 2rem', marginBottom: '2.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <div className="courses-list-title-section">
          <h1 className="courses-list-title" style={{fontWeight: 800, fontSize: '2.1rem', color: '#b8860b', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.7rem'}}>
            <FaBook className="courses-list-icon" />
            Course Management
          </h1>
          <p className="courses-list-subtitle" style={{fontSize: '1.1rem', color: '#8b4513', opacity: 0.85}}>Overview of all courses in the platform</p>
        </div>
        <div className="courses-list-actions">
          <motion.button
            className="courses-list-refresh-btn"
            onClick={handleRefresh}
            disabled={refreshing}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{background: 'linear-gradient(135deg, #b8860b 0%, #d4a574 100%)', color: 'white'}}
          >
            <FaSync className={refreshing ? 'spinning' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </motion.button>
          <motion.button
            className="courses-list-add-btn"
            onClick={handleAddCourse}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaPlus />
            Add Course
          </motion.button>
        </div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="courses-list-error"
        >
          {error}
        </motion.div>
      )}

      <div className="courses-list-content">
        {Object.keys(groupedCourses).length === 0 ? (
          <div className="courses-list-empty">
            <FaBook className="courses-list-empty-icon" />
            <h3>No courses available</h3>
            <p>Start by adding your first course to the platform.</p>
            <motion.button
              className="courses-list-add-btn"
              onClick={handleAddCourse}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaPlus />
              Add Your First Course
            </motion.button>
          </div>
        ) : (
          <div className="courses-list-groups">
            {Object.entries(groupedCourses).map(([group, groupCourses], groupIndex) => (
              <motion.div
                key={group}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: groupIndex * 0.1 }}
                className="courses-list-group"
              >
                <h2 className="courses-list-group-title">{group}</h2>
                <div className="courses-list-table-container">
                  <table className="courses-list-table">
                    <thead>
                      <tr>
                        <th className="courses-list-table-th">Course Name</th>
                        <th className="courses-list-table-th">Description</th>
                        <th className="courses-list-table-th">Video ID</th>
                        <th className="courses-list-table-th">Tasks</th>
                        <th className="courses-list-table-th">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {groupCourses.map((course, index) => (
                        <motion.tr
                          key={course.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: (groupIndex * 0.1) + (index * 0.05) }}
                          className="courses-list-row"
                        >
                          <td className="courses-list-cell courses-list-name">
                            <div className="courses-list-name-content">
                              <strong>{course.name}</strong>
                              <span className="courses-list-meta">
                                Year {course.year} • Semester {course.semester}
                              </span>
                            </div>
                          </td>
                          <td className="courses-list-cell courses-list-description">
                            {course.description || 'No description available'}
                          </td>
                          <td className="courses-list-cell courses-list-video">
                            <div className="courses-list-video-content">
                              <span className="courses-list-video-id">{course.video_id}</span>
                              {course.video_id && (
                                <img
                                  src={`https://img.youtube.com/vi/${extractVideoId(course.video_id)}/hqdefault.jpg`}
                                  alt="Video thumbnail"
                                  className="courses-list-thumbnail large-thumbnail"
                                />
                              )}
                            </div>
                          </td>
                          <td className="courses-list-cell courses-list-tasks" style={{textAlign: 'center'}}>
                            <span className="tasks-number-container">{course.tasks ? course.tasks.length : 0}</span>
                          </td>
                          <td className="courses-list-cell courses-list-actions-cell">
                            <div className="courses-list-action-buttons" style={{flexWrap: 'nowrap', minHeight: '48px'}}>
                              <motion.button
                                className="courses-list-action-btn courses-list-view-btn"
                                onClick={() => window.open(`https://youtube.com/watch?v=${extractVideoId(course.video_id)}`, '_blank')}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                title="View Video"
                              >
                                <FaEye />
                              </motion.button>
                              <motion.button
                                className="courses-list-action-btn courses-list-edit-btn"
                                onClick={() => handleEditCourse(course)}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                title="Edit Course"
                              >
                                <FaEdit />
                              </motion.button>
                              <motion.button
                                className="courses-list-action-btn courses-list-delete-btn"
                                onClick={() => handleDeleteCourse(course.id)}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                title="Delete Course"
                              >
                                <FaTrash />
                              </motion.button>
                              <motion.button
                                className="courses-list-action-btn courses-list-tasks-btn-modern"
                                onClick={() => handleManageTasks(course.id)}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                title="Manage Tasks"
                                style={{background: 'linear-gradient(135deg, #C89F9C 0%, #A97C78 100%)', color: 'white'}}
                              >
                                <FaTasks />
                              </motion.button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showForm && (
          <>
            <CourseForm
              editingCourse={editingCourse}
              onSuccess={handleCourseSuccess}
            />
          </>
        )}
      </AnimatePresence>

      {/* Confirmation Modal for Delete */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, courseId: null, courseName: '' })}
        onConfirm={confirmDeleteCourse}
        title="Delete Course"
        message={`Are you sure you want to delete "${deleteModal.courseName}"? This action cannot be undone and will also remove all associated tasks.`}
        confirmText="Delete Course"
        cancelText="Cancel"
        type="danger"
      />

      {/* Success Notification */}
      <SuccessNotification
        isVisible={successNotification.isVisible}
        onClose={() => setSuccessNotification({ isVisible: false, message: '', type: 'success' })}
        message={successNotification.message}
        type={successNotification.type}
      />
    </div>
  );
};

export default CoursesList;
