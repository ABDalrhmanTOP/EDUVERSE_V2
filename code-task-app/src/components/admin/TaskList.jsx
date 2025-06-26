import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import TaskForm from './TaskForm';
import ConfirmationModal from './ConfirmationModal';
import SuccessNotification from './SuccessNotification';
import { Modal } from 'react-bootstrap';
import { useParams, useNavigate } from "react-router-dom";
import { FaEdit, FaTrash, FaArrowLeft, FaPlus } from 'react-icons/fa';
import { motion } from 'framer-motion';
import '../../styles/admin/TasksDashboard.css';

const TaskList = () => {
  const { course_id } = useParams();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [courseName, setCourseName] = useState('');
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

  const fetchTasks = async () => {
    try {
      const tasksResponse = await api.get(`/tasks/${course_id}`);
      setTasks(tasksResponse.data);
      
      // Get course name from the first task's playlist data
      if (tasksResponse.data && tasksResponse.data.length > 0) {
        const courseName = tasksResponse.data[0]?.playlist?.name || `Course ${course_id}`;
        setCourseName(courseName);
      } else {
        setCourseName(`Course ${course_id}`);
      }
      
      setError('');
    } catch (error) {
      setError("Failed to fetch tasks. Please try again.");
      setTasks([]);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [course_id]);

  const handleDelete = async (id) => {
    const task = tasks.find(t => t.id === id);
    setDeleteModal({
      isOpen: true,
      taskId: id,
      taskTitle: task ? task.title : 'this task'
    });
  };

  const confirmDeleteTask = async () => {
    try {
      await api.delete(`/tasks/${deleteModal.taskId}`);
      fetchTasks(); // إعادة تحميل المهام بعد الحذف
      setDeleteModal({ isOpen: false, taskId: null, taskTitle: '' });
      
      // Show success notification
      setSuccessNotification({
        isVisible: true,
        message: `Task "${deleteModal.taskTitle}" has been successfully deleted.`,
        type: 'deleted'
      });
    } catch (err) {
      setError('Error deleting task');
      setDeleteModal({ isOpen: false, taskId: null, taskTitle: '' });
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    fetchTasks();
    
    // Show success notification
    setSuccessNotification({
      isVisible: true,
      message: editingTask 
        ? `Task "${editingTask.title}" has been successfully updated.`
        : 'New task has been successfully created.',
      type: editingTask ? 'updated' : 'added'
    });
  };

  return (
    <div className="task-list-container task-list-modern">
      <div className="task-list-header task-list-modern-header">
        <div className="task-list-header-left">
          <motion.button
            onClick={() => navigate('/AdminDashboard/courses')}
            className="task-list-return-btn"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaArrowLeft />
            Back to Courses
          </motion.button>
          <div className="task-list-title-section">
            <h1 style={{fontWeight:'800',fontSize:'2.1rem',color:'#b8860b',marginBottom:'0.2rem'}}>Task Management</h1>
            <p style={{fontSize:'1.1rem',color:'#8b4513',opacity:0.85}}>Course: <span style={{fontWeight:'700',color:'#5d3a00'}}>{courseName}</span></p>
          </div>
        </div>
        <motion.button
          onClick={() => { setEditingTask(null); setShowForm(true); }}
          className="task-list-add-btn"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FaPlus />
          Add Task
        </motion.button>
      </div>

      {error && (
        <div className="task-list-error">
          {error}
        </div>
      )}

      <div className="task-list-content task-list-modern-content">
        {tasks.length === 0 ? (
          <div className="task-list-empty">
            <h3>No tasks found</h3>
            <p>Start by adding your first task to this course.</p>
          </div>
        ) : (
          <div className="task-list-table-container">
            <table className="task-list-table task-list-modern-table">
              <thead>
                <tr>
                  <th style={{fontSize:'1.1rem',padding:'1.2rem'}}>ID</th>
                  <th style={{fontSize:'1.1rem',padding:'1.2rem'}}>Title</th>
                  <th style={{fontSize:'1.1rem',padding:'1.2rem'}}>Timestamp</th>
                  <th style={{fontSize:'1.1rem',padding:'1.2rem'}}>Type</th>
                  <th style={{fontSize:'1.1rem',padding:'1.2rem'}}>Question</th>
                  <th style={{fontSize:'1.1rem',padding:'1.2rem'}}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map(task => (
                  <motion.tr
                    key={task.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="task-list-row"
                  >
                    <td>{task.id}</td>
                    <td className="task-title" style={{fontSize:'1rem',padding:'1.2rem'}}>{task.title}</td>
                    <td className="task-timestamp" style={{fontSize:'1rem',padding:'1.2rem'}}>{task.timestamp}</td>
                    <td>
                      <span className={`task-type-badge ${['coding','CODE','code'].includes(task.type) ? 'task-type-CODE' : task.type === 'mcq' ? 'task-type-mcq' : task.type === 'truefalse' ? 'task-type-truefalse' : ''}`}
                        style={{ fontSize: '1rem', padding: '6px 18px', minWidth: '90px', display: 'inline-block', textAlign: 'center' }}>
                        {['coding','CODE','code'].includes(task.type) ? 'Coding' : task.type === 'mcq' ? 'MCQ' : task.type === 'truefalse' ? 'True/False' : task.type}
                      </span>
                    </td>
                    <td className="task-question" style={{fontSize:'1rem',padding:'1.2rem'}}>{task.prompt || task.question}</td>
                    <td className="task-actions">
                      <motion.button
                        className="task-action-btn task-edit-btn"
                        onClick={() => { setEditingTask(task); setShowForm(true); }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        title="Edit Task"
                      >
                        <FaEdit />
                      </motion.button>
                      <motion.button
                        className="task-action-btn task-delete-btn"
                        onClick={() => handleDelete(task.id)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        title="Delete Task"
                      >
                        <FaTrash />
                      </motion.button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal show={showForm} onHide={() => setShowForm(false)} centered backdrop="static">
        <Modal.Header closeButton className="task-modal-header">
          <Modal.Title>{editingTask ? 'Edit Task' : 'Add New Task'}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="task-modal-body">
          <TaskForm
            editingTask={editingTask}
            courseId={course_id}
            onSuccess={handleFormSuccess}
            onClose={() => setShowForm(false)}
          />
        </Modal.Body>
      </Modal>

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

export default TaskList;
