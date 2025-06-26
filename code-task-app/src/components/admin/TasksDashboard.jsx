import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import axios from '../../api/axios';
import TaskForm from './TaskForm';
import ConfirmationModal from './ConfirmationModal';
import SuccessNotification from './SuccessNotification';
import { useLocation } from 'react-router-dom';
import '../../styles/admin/TasksDashboard.css';

const TasksDashboard = () => {
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
        axios.get('/tasks'),
        axios.get('/courses')
      ]);
      setTasks(tasksRes.data || []);
      setCourses(coursesRes.data || []);
    } catch (error) {
      setError('Failed to load tasks and courses');
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
      taskTitle: task ? task.title : 'this task'
    });
  };

  const confirmDeleteTask = async () => {
    try {
      await axios.delete(`/task/${deleteModal.taskId}`);
      setTasks(tasks.filter(task => task.id !== deleteModal.taskId));
      setDeleteModal({ isOpen: false, taskId: null, taskTitle: '' });
      
      // Show success notification
      setSuccessNotification({
        isVisible: true,
        message: `Task "${deleteModal.taskTitle}" has been successfully deleted.`,
        type: 'deleted'
      });
    } catch (error) {
      setError('Failed to delete task');
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
        ? `Task "${editingTask.title}" has been successfully updated.`
        : 'New task has been successfully created.',
      type: editingTask ? 'updated' : 'added'
    });
  };

  const isCodingType = (type) => {
    if (!type) return false;
    const t = type.toLowerCase();
    return t === 'coding' || t === 'code';
  };

  const isTrueFalseType = (type) => {
    if (!type) return false;
    const t = type.toLowerCase();
    return t === 'true_false' || t === 'truefalse';
  };

  const getTaskTypeIcon = (type) => {
    if (isCodingType(type)) return <FaCode className="task-type-icon coding" />;
    switch (type?.toLowerCase()) {
      case 'mcq':
        return <FaListUl className="task-type-icon mcq" />;
      case 'true_false':
      case 'truefalse':
        return <FaCheckCircle className="task-type-icon tf" />;
      default:
        return null;
    }
  };

  const getTaskTypeLabel = (type) => {
    if (isCodingType(type)) return 'Coding';
    switch (type?.toLowerCase()) {
      case 'mcq':
        return 'Multiple Choice';
      case 'true_false':
        return 'True/False';
      default:
        return type;
    }
  };

  const getCourseName = (courseId, playlist) => {
    if (playlist && playlist.name) return playlist.name;
    const course = courses.find(c => c.id === courseId || c.id === (playlist && playlist.id));
    return course ? course.name : 'Unknown Course';
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
          {loading ? <span className="stat-loading">...</span> : value}
        </h3>
        <p className="tasks-stat-title">{title}</p>
      </div>
    </motion.div>
  );

  return (
    <div className="tasks-dashboard-container">
      <div className="tasks-dashboard-header">
        <div className="tasks-dashboard-title">
          <h1>Tasks Management</h1>
          <p>Overview of all tasks across all courses</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={fetchData}
          disabled={loading}
          className="tasks-refresh-btn"
          style={{marginLeft: 0, marginRight: '1rem'}}
        >
          <FaSync className={loading ? 'spinning' : ''} />
          {loading ? 'Refreshing...' : 'Refresh'}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleAddTask}
          className="add-task-btn"
        >
          <FaPlus /> Add New Task
        </motion.button>
      </div>

      {error && (
        <div className="tasks-error">
          {error}
        </div>
      )}

      <div className="tasks-stats-grid">
        <StatCard
          title="Total Tasks"
          value={tasks.length}
          icon={FaTasks}
          color="#C89F9C"
          delay={0.1}
        />
        <StatCard
          title="MCQ Tasks"
          value={tasks.filter(t => (t.type?.toLowerCase?.() === 'mcq')).length}
          icon={FaListUl}
          color="#3B82F6"
          delay={0.2}
        />
        <StatCard
          title="True/False Tasks"
          value={tasks.filter(t => isTrueFalseType(t.type)).length}
          icon={FaCheckCircle}
          color="#10B981"
          delay={0.3}
        />
        <StatCard
          title="Coding Tasks"
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
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="filter-section">
          <div className="filter-group">
            <label>Course:</label>
            <select
              className="custom-select"
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
            >
              <option value="">All Courses</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label>Type:</label>
            <select
              className="custom-select"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="mcq">Multiple Choice</option>
              <option value="true_false">True/False</option>
              <option value="coding">Coding</option>
            </select>
          </div>
        </div>
      </div>

      <div className="tasks-content">
        <div className="tasks-table-container">
          <table className="tasks-table">
            <thead>
              <tr>
                <th>Task</th>
                <th>Course</th>
                <th>Type</th>
                <th>Timestamp</th>
                <th>Points</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 4 }).map((_, idx) => (
                  <tr key={idx} className="tasks-row loading-row">
                    <td colSpan={6}><div className="loading-skeleton" style={{height:'24px',width:'100%'}} /></td>
                  </tr>
                ))
              ) : filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="tasks-empty">
                    <p>{searchTerm || filterType !== 'all' ? 'Try adjusting your search or filters.' : 'No tasks have been created yet.'}</p>
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
                          title="Edit Task"
                        >
                          <FaEdit />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDeleteTask(task.id)}
                          className="action-btn delete-btn"
                          title="Delete Task"
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
        title="Delete Task"
        message={`Are you sure you want to delete "${deleteModal.taskTitle}"? This action cannot be undone.`}
        confirmText="Delete Task"
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

export default TasksDashboard; 