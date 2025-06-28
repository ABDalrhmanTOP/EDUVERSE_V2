import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaSearch, 
  FaFilter, 
  FaEye,
  FaQuestionCircle,
  FaCheckCircle,
  FaCode,
  FaSync,
  FaListUl,
  FaTasks
} from 'react-icons/fa';
import apiClient from '../../api/axios';
import TaskForm from './TaskForm';
import ConfirmationModal from './ConfirmationModal';
import SuccessNotification from './SuccessNotification';
import { useLocation } from 'react-router-dom';
import '../../styles/admin/TasksDashboard.css';

const TasksDashboard = () => {
  const { t, i18n } = useTranslation();
  const [tasks, setTasks] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showMultiTaskForm, setShowMultiTaskForm] = useState(false);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    taskId: null,
    taskTitle: ''
  });
  const [successNotification, setSuccessNotification] = useState({
    isVisible: false,
    message: '',
    type: 'success'
  });
  const location = useLocation();

  // Function to format numbers in Arabic
  const formatNumber = (num) => {
    if (i18n.language === 'ar') {
      return num.toLocaleString('ar-EG');
    }
    return num.toLocaleString();
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const courseParam = params.get('course');
    if (courseParam) setSelectedCourse(courseParam);
    else setSelectedCourse('');
    fetchData();
    // eslint-disable-next-line
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tasksRes, coursesRes] = await Promise.all([
        apiClient.get('/admin/tasks'),
        apiClient.get('/admin/courses')
      ]);
      setTasks(tasksRes.data || []);
      setCourses(coursesRes.data || []);
    } catch (error) {
      setError(t('admin.tasks.failedToLoadTasks'));
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = () => {
    setEditingTask(null);
    setShowTaskForm(true);
  };

  const handleAddMultiTask = () => {
    setEditingTask(null);
    setShowMultiTaskForm(true);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  const handleDeleteTask = async (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    setDeleteModal({
      isOpen: true,
      taskId: taskId,
      taskTitle: task ? task.title : t('admin.tasks.editTaskTitle')
    });
  };

  const confirmDeleteTask = async () => {
    try {
      await apiClient.delete(`/task/${deleteModal.taskId}`);
      setTasks(tasks.filter(task => task.id !== deleteModal.taskId));
      setDeleteModal({ isOpen: false, taskId: null, taskTitle: '' });
      
      // Show success notification
      setSuccessNotification({
        isVisible: true,
        message: t('admin.tasks.taskDeletedSuccess', { taskTitle: deleteModal.taskTitle }),
        type: 'deleted'
      });
    } catch (error) {
      setError(t('admin.tasks.failedToLoadTasks'));
      setDeleteModal({ isOpen: false, taskId: null, taskTitle: '' });
    }
  };

  const handleSaveTask = (savedTask) => {
    if (editingTask) {
      setTasks(tasks.map(task => task.id === savedTask.id ? savedTask : task));
    } else {
      setTasks([...tasks, savedTask]);
    }
    setShowTaskForm(false);
    setEditingTask(null);
    
    // Show success notification
    setSuccessNotification({
      isVisible: true,
      message: editingTask 
        ? t('admin.tasks.taskUpdatedSuccess', { taskTitle: editingTask.title })
        : t('admin.tasks.taskAddedSuccess'),
      type: editingTask ? 'updated' : 'added'
    });
  };

  const isCodingType = (type) => {
    if (!type) return false;
    const t = type.toLowerCase();
    return t === 'coding' || t === 'code' || t === 'CODE';
  };

  const isTrueFalseType = (type) => {
    if (!type) return false;
    const t = type.toLowerCase();
    return t === 'true_false' || t === 'truefalse' || t === 'TRUE_FALSE';
  };

  const getTaskTypeIcon = (type) => {
    if (!type) {
      return <FaQuestionCircle style={{color: '#6B7280', fontSize: '1.2rem'}} />;
    }
    const t = type.toLowerCase();
    
    if (t === 'coding' || t === 'code' || t === 'CODE') {
      return <FaCode style={{color: '#F59E0B', fontSize: '1.2rem', marginRight: i18n.language === 'ar' ? '0' : '8px', marginLeft: i18n.language === 'ar' ? '8px' : '0'}} />;
    }
    if (t === 'mcq') {
      return <FaListUl style={{color: '#3B82F6', fontSize: '1.2rem', marginRight: i18n.language === 'ar' ? '0' : '8px', marginLeft: i18n.language === 'ar' ? '8px' : '0'}} />;
    }
    if (t === 'true_false' || t === 'truefalse' || t === 'TRUE_FALSE') {
      return <FaCheckCircle style={{color: '#10B981', fontSize: '1.2rem', marginRight: i18n.language === 'ar' ? '0' : '8px', marginLeft: i18n.language === 'ar' ? '8px' : '0'}} />;
    }
    return <FaQuestionCircle style={{color: '#6B7280', fontSize: '1.2rem'}} />;
  };

  const getTaskTypeLabel = (taskType) => {
    if (!taskType) return '';
    const type = taskType.toLowerCase();
    if (type === 'coding' || type === 'code' || type === 'CODE') return t('admin.tasks.coding');
    if (type === 'mcq') return t('admin.tasks.multipleChoice');
    if (type === 'true_false' || type === 'truefalse' || type === 'TRUE_FALSE') return t('admin.tasks.trueFalse');
    return taskType;
  };

  const getCourseName = (courseId, playlist) => {
    if (playlist && playlist.name) return playlist.name;
    const course = courses.find(c => c.id === courseId || c.id === (playlist && playlist.id));
    return course ? course.name : t('admin.tasks.unknownCourse');
  };

  const filteredTasks = tasks.filter(task => {
    const taskCourseId = task.course_id ?? (task.playlist && task.playlist.id);
    const matchesSearch = (task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          task.description?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCourse = !selectedCourse || String(taskCourseId) === String(selectedCourse);
    const matchesType = filterType === 'all' ||
      (filterType === 'coding' && isCodingType(task.type)) ||
      ((filterType === 'true_false' || filterType === 'truefalse') && isTrueFalseType(task.type)) ||
      (filterType !== 'coding' && filterType !== 'true_false' && filterType !== 'truefalse' && task.type === filterType);
    return matchesSearch && matchesCourse && matchesType;
  });

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    if (typeof timestamp === 'string') {
      // If already in mm:ss or hh:mm:ss or similar, return as is
      if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(timestamp)) return timestamp;
      // If it's a number string, parse it
      const num = Number(timestamp);
      if (!isNaN(num)) {
        const minutes = Math.floor(num / 60);
        const seconds = num % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      }
      return 'N/A';
    }
    if (typeof timestamp === 'number' && !isNaN(timestamp)) {
      const minutes = Math.floor(timestamp / 60);
      const seconds = timestamp % 60;
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return 'N/A';
  };

  const StatCard = ({ title, value, icon: Icon, color, delay }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="tasks-stat-card"
      style={{ '--card-color': color }}
    >
      <div className="tasks-stat-icon">
        <Icon />
      </div>
      <div className="tasks-stat-content">
        <h3 className="tasks-stat-value">
          {loading ? <span className="stat-loading">...</span> : formatNumber(value)}
        </h3>
        <p className="tasks-stat-title">{title}</p>
      </div>
    </motion.div>
  );

  return (
    <div className="tasks-dashboard-container" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
      {loading ? (
        <div className="tasks-dashboard-loading">
          <div className="tasks-loading-spinner"></div>
          <p>{t('admin.tasks.loading')}</p>
        </div>
      ) : (
        <>
          <div className="tasks-dashboard-header">
            <div className="tasks-dashboard-title">
              <h1>{t('admin.tasks.title')}</h1>
              <p>{t('admin.tasks.subtitle')}</p>
            </div>
            <div className="tasks-header-actions">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchData}
                disabled={loading}
                className="courses-list-refresh-btn"
              >
                <FaSync className={loading ? 'spinning' : ''} />
                {loading ? t('admin.tasks.refreshing') : t('common.refresh')}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAddTask}
                className="add-task-btn"
              >
                <FaPlus /> {t('admin.tasks.addTask')}
              </motion.button>
            </div>
          </div>

          {error && (
            <div className="tasks-error">
              {error}
            </div>
          )}

          <div className="tasks-stats-grid">
            <StatCard
              title={t('admin.tasks.totalTasks')}
              value={tasks.length}
              icon={FaTasks}
              color="#C89F9C"
              delay={0.1}
            />
            <StatCard
              title={t('admin.tasks.mcqTasks')}
              value={tasks.filter(t => (t.type?.toLowerCase?.() === 'mcq')).length}
              icon={FaListUl}
              color="#3B82F6"
              delay={0.2}
            />
            <StatCard
              title={t('admin.tasks.trueFalseTasks')}
              value={tasks.filter(t => isTrueFalseType(t.type)).length}
              icon={FaCheckCircle}
              color="#10B981"
              delay={0.3}
            />
            <StatCard
              title={t('admin.tasks.codingTasks')}
              value={tasks.filter(t => isCodingType(t.type)).length}
              icon={FaCode}
              color="#F59E0B"
              delay={0.4}
            />
          </div>

          <div className="tasks-filters">
            <div className="search-section">
              <div className="search-input">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder={t('admin.tasks.searchTasks')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="filter-section">
              <div className="filter-group">
                <label>{t('admin.tasks.course')}:</label>
                <select
                  className="custom-select"
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                >
                  <option value="">{t('admin.tasks.allCourses')}</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>
                      {course.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="filter-group">
                <label>{t('admin.tasks.type')}:</label>
                <select
                  className="custom-select"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="all">{t('admin.tasks.allTypes')}</option>
                  <option value="mcq">{t('admin.tasks.multipleChoice')}</option>
                  <option value="true_false">{t('admin.tasks.trueFalse')}</option>
                  <option value="coding">{t('admin.tasks.coding')}</option>
                </select>
              </div>
            </div>
          </div>

          <div className="tasks-content">
            <div className="tasks-table-container">
              <table className="tasks-table">
                <thead>
                  <tr>
                    <th>{t('admin.tasks.taskName')}</th>
                    <th>{t('admin.tasks.course')}</th>
                    <th>{t('admin.tasks.type')}</th>
                    <th>{t('admin.tasks.timestamp')}</th>
                    <th>{t('admin.tasks.points')}</th>
                    <th>{t('admin.tasks.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="tasks-empty">
                        <p>{searchTerm || filterType !== 'all' ? t('admin.tasks.adjustSearchFilters') : t('admin.tasks.noTasksCreated')}</p>
                      </td>
                    </tr>
                  ) : (
                    filteredTasks.map((task, index) => {
                      return (
                        <motion.tr
                          key={task.id}
                          className="tasks-row"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <td>
                            <div className="task-title">{task.title}</div>
                            {task.description && (
                              <div className="task-description">{task.description}</div>
                            )}
                          </td>
                          <td className="task-course">{getCourseName(task.course_id, task.playlist)}</td>
                          <td>
                            <div className="task-type">
                              {getTaskTypeIcon(task.type)}
                              <span>{getTaskTypeLabel(task.type)}</span>
                            </div>
                          </td>
                          <td className="task-timestamp">{formatTimestamp(task.timestamp)}</td>
                          <td className="points">{task.points || 1} pts</td>
                          <td className="actions">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleEditTask(task)}
                              className="action-btn edit-btn"
                              title={t('admin.tasks.editTaskTitle')}
                            >
                              <FaEdit />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleDeleteTask(task.id)}
                              className="action-btn delete-btn"
                              title={t('admin.tasks.deleteTaskTitle')}
                            >
                              <FaTrash />
                            </motion.button>
                          </td>
                        </motion.tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <AnimatePresence>
        {showTaskForm && (
          <TaskForm
            key="single-task-form"
            onSave={handleSaveTask}
            onCancel={() => setShowTaskForm(false)}
            isEditing={!!editingTask}
            task={editingTask}
            wide
          />
        )}
        {showMultiTaskForm && (
          <TaskForm
            key="multi-task-form"
            onSave={(tasksArr) => {
              // handle saving multiple tasks (API call for each or batch if supported)
              setShowMultiTaskForm(false);
              fetchData();
            }}
            onCancel={() => setShowMultiTaskForm(false)}
            multi
            wide
          />
        )}
      </AnimatePresence>

      {/* Confirmation Modal for Delete */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, taskId: null, taskTitle: '' })}
        onConfirm={confirmDeleteTask}
        title={t('admin.tasks.deleteTaskTitle')}
        message={t('admin.tasks.deleteTaskConfirm', { taskTitle: deleteModal.taskTitle })}
        confirmText={t('admin.tasks.deleteTaskTitle')}
        cancelText={t('common.cancel')}
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

export default TasksDashboard; 