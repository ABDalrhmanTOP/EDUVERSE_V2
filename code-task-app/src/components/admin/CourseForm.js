import React, { useEffect, useState } from 'react';
import axios from '../../api/axios.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from 'react-router-dom';

const CourseForm = ({ editingCourse, onSuccess }) => {
  const [video_id, setVideo_ID] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (editingCourse) {
      setVideo_ID(editingCourse.video_id);
      setName(editingCourse.name);
      setDescription(editingCourse.description);
    } else {
      setVideo_ID('');
      setName('');
      setDescription('');
    }
  }, [editingCourse]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { video_id, name, description };

    try {
      if (editingCourse) {
        await axios.put(`/courses/${editingCourse.id}`, data);
      } else {
        await axios.post('/courses', data);
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving course:', error);
      // Optionally, add user-friendly error handling here (e.g., a toast notification)
    }
  };
  return (
    <div className="container mt-3" >
      <div className="card shadow-lg border-0 rounded-4 p-5" style={{ backgroundColor: "#AD998A"}}>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="video_id" className="form-label fw-bold text-secondary">
              🎬 Video ID <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              id="video_id"
              className="form-control form-control-lg border-2"
              placeholder="Enter YouTube or internal video ID (e.g., dQw4w9WgXcQ)"
              value={video_id}
              onChange={(e) => setVideo_ID(e.target.value)}
              required
            />
            <small className="form-text text-muted">
              This could be a YouTube video ID or an ID from your internal video platform.
            </small>
          </div>

          <div className="mb-4">
            <label htmlFor="name" className="form-label fw-bold text-secondary">
              📚 Course Title <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              id="name"
              className="form-control form-control-lg border-2"
              placeholder="e.g., Master React Hooks: A Comprehensive Guide"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="mb-5">
            <label htmlFor="description" className="form-label fw-bold text-secondary">
              📝 Course Description
            </label>
            <textarea
              id="description"
              className="form-control border-2"
              placeholder="Provide a brief, engaging summary of the course content and what learners will achieve."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="6"
            />
          </div>

          <div className="d-grid gap-2 col-8 mx-auto">
            <button type="submit" className="btn btn-lg rounded-pill shadow" style={{ backgroundColor: '#6B705C', borderColor: '#6B705C' }}>
              {editingCourse ? ' Save Changes' : ' Add Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CourseForm;