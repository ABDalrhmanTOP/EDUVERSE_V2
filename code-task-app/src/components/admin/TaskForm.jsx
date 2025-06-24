import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import 'bootstrap/dist/css/bootstrap.min.css'; // Ensure Bootstrap CSS is imported
import './TaskForm.css'; // Import the new custom CSS

const emptyTask = {
  playlist_id: '',
  video_id: '',
  timestamp: '',
  title: '',
  prompt: '',
  expected_output: '',
  syntax_hint: '',
  type: '',
};

const TaskForm = ({ editingTask, onSuccess, onClose }) => {
  const [task, setTask] = useState(emptyTask);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingTask) {
      setTask(editingTask);
    } else {
      setTask(emptyTask);
    }
    setErrors({});
  }, [editingTask]);

  const handleChange = (e) => {
    setTask({ ...task, [e.target.name]: e.target.value });

    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!task.playlist_id) newErrors.playlist_id = 'Course ID is required.';
    if (!task.title) newErrors.title = 'Title is required.';
    if (!task.prompt) newErrors.prompt = 'Prompt or question is required.';
    if (!task.expected_output) newErrors.expected_output = 'Expected answer is required.';
    if (!task.type) newErrors.type = 'Task type is required.';

    if (task.timestamp && isNaN(Number(task.timestamp))) {
      newErrors.timestamp = 'The timestamp must be a number.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      if (editingTask) {
        await api.put(`/tasks/${editingTask.id}`, task);
        onSuccess('The mission has been updated successfully!');
      } else {
        await api.post('/tasks', task);
        onSuccess('The task has been added successfully.');
      }
      onClose();
    } catch (error) {
      console.error('Error saving task:', error);
      onSuccess(`Error saving task: ${error.response?.data?.message || error.message}`, true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-3">
      <div className="card shadow-lg border-0 rounded-4 p-5 task-form-custom-card"> {/* Apply custom card class */}
        <h3 className="text-center mb-4 fw-bold custom-form-title">
          {/* {editingTask ? 'Edit Task' : 'Add New Task'} */}
        </h3>
        <form onSubmit={handleSubmit} className="row g-3">
          <div className="col-md-5">
            <label htmlFor="playlist_id" className="form-label fw-bold text-secondary">
              Course ID <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className={`form-control form-control-lg border-2 ${errors.playlist_id ? 'is-invalid' : ''}`}
              id="playlist_id"
              name="playlist_id"
              value={task.playlist_id}
              onChange={handleChange}
              placeholder="e.g., 123"
            />
            {errors.playlist_id && <div className="invalid-feedback">{errors.playlist_id}</div>}
          </div>

          <div className="col-md-7">
            <label htmlFor="timestamp" className="form-label fw-bold text-secondary">
              Timestamp (seconds)
            </label>
            <input
              type="number"
              className={`form-control form-control-lg border-2 ${errors.timestamp ? 'is-invalid' : ''}`}
              id="timestamp"
              name="timestamp"
              value={task.timestamp}
              onChange={handleChange}
              placeholder="e.g., 360 (6 minutes)"
            />
            {errors.timestamp && <div className="invalid-feedback">{errors.timestamp}</div>}
          </div>

          <div className="col-12">
            <label htmlFor="title" className="form-label fw-bold text-secondary">
              Title <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className={`form-control form-control-lg border-2 ${errors.title ? 'is-invalid' : ''}`}
              id="title"
              name="title"
              value={task.title}
              onChange={handleChange}
              placeholder="e.g., Introduction to React Hooks"
            />
            {errors.title && <div className="invalid-feedback">{errors.title}</div>}
          </div>

          <div className="col-md-6">
            <label htmlFor="type" className="form-label fw-bold text-secondary">
              Task Type <span className="text-danger">*</span>
            </label>
            <select
              className={`form-select form-select-lg border-2 ${errors.type ? 'is-invalid' : ''}`}
              id="type"
              name="type"
              value={task.type}
              onChange={handleChange}
            >
              <option value="">Choose a type...</option>
              <option value="coding">Code</option>
              <option value="quiz">Quiz</option>
              <option value="multiple_choice">Multiple Choice</option>
            </select>
            {errors.type && <div className="invalid-feedback">{errors.type}</div>}
          </div>

          <div className="col-md-6">
            <label htmlFor="syntax_hint" className="form-label fw-bold text-secondary">
              Syntax Hint
            </label>
            <input
              type="text"
              className="form-control form-control-lg border-2"
              id="syntax_hint"
              name="syntax_hint"
              value={task.syntax_hint}
              onChange={handleChange}
              placeholder="e.g., JavaScript, Python, SQL"
            />
          </div>

          <div className="col-12">
            <label htmlFor="prompt" className="form-label fw-bold text-secondary">
              Prompt <span className="text-danger">*</span>
            </label>
            <textarea
              className={`form-control border-2 ${errors.prompt ? 'is-invalid' : ''}`}
              id="prompt"
              name="prompt"
              rows="4"
              value={task.prompt}
              onChange={handleChange}
              placeholder="The question here is..."
            ></textarea>
            {errors.prompt && <div className="invalid-feedback">{errors.prompt}</div>}
          </div>

          <div className="col-12">
            <label htmlFor="expected_output" className="form-label fw-bold text-secondary">
              Expected Output <span className="text-danger">*</span>
            </label>
            <textarea
              className={`form-control border-2 ${errors.expected_output ? 'is-invalid' : ''}`}
              id="expected_output"
              name="expected_output"
              rows="4"
              value={task.expected_output}
              onChange={handleChange}
              placeholder="Expected answer or code output"
            ></textarea>
            {errors.expected_output && <div className="invalid-feedback">{errors.expected_output}</div>}
          </div>

          <div className="col-12 d-flex justify-content-end gap-2 mt-4">
            <button
              type="button"
              className="btn btn-lg rounded-pill shadow custom-btn-secondary" // Apply custom secondary button class
              onClick={onClose}
              disabled={loading}
            >
              Close
            </button>
            <button
              type="submit"
              className="btn btn-lg rounded-pill shadow custom-btn-primary" // Apply custom primary button class
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Loading...
                </>
              ) : editingTask ? (
                'Update Task'
              ) : (
                'Add Task'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;